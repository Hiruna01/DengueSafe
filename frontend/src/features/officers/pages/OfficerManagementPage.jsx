import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Input,
  Pagination,
  Select,
  Spinner,
  formatDate,
  useDebounced,
} from '../../../shared'
import { useAuth } from '../../../app/AuthContext'
import { ACTIVE_FILTERS, OFFICER_ROLES, getOfficers, setOfficerActive } from '../api/officersApi'
import AddOfficerModal from '../components/AddOfficerModal'

const PAGE_SIZE = 10

/*
  Admin-only account management.

  The interesting part is the guard rails: the API refuses to let an officer
  deactivate themselves, or to remove the last active Admin. Those answers come
  back as plain 400s, and this page shows them verbatim rather than trying to
  predict them — the server is the only thing that knows the current count.
*/
export default function OfficerManagementPage() {
  const [params, setParams] = useSearchParams()
  const { officer: currentOfficer } = useAuth()

  const role = params.get('role') ?? ''
  const isActive = params.get('isActive') ?? ''
  const page = Number(params.get('page') ?? 1)

  const [searchInput, setSearchInput] = useState(params.get('search') ?? '')
  const search = useDebounced(searchInput, 300)

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [pendingToggle, setPendingToggle] = useState(null)
  const [toggling, setToggling] = useState(false)
  const [notice, setNotice] = useState('')

  const query = useMemo(
    () => ({ search, role, isActive, page, pageSize: PAGE_SIZE }),
    [search, role, isActive, page],
  )

  const load = useCallback(() => {
    setLoading(true)
    setError('')

    getOfficers(query)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [query])

  useEffect(load, [load])

  useEffect(() => {
    const current = params.get('search') ?? ''
    if (current === search) return

    const next = new URLSearchParams(params)
    if (search) next.set('search', search)
    else next.delete('search')
    next.delete('page')
    setParams(next, { replace: true })
  }, [search, params, setParams])

  function setFilter(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  function setPage(nextPage) {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }

  async function confirmToggle() {
    if (!pendingToggle) return

    setToggling(true)
    setError('')

    try {
      const updated = await setOfficerActive(pendingToggle.id, !pendingToggle.isActive)
      setNotice(
        `${updated.fullName} is now ${updated.isActive ? 'active' : 'deactivated'}.`,
      )
      setPendingToggle(null)
      load()
    } catch (err) {
      // A guard rail, most likely: self-deactivation or the last active Admin.
      setError(err.message)
      setPendingToggle(null)
    } finally {
      setToggling(false)
    }
  }

  const officers = result?.items ?? []

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-ink">Officers</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Who can sign in, what they can do, and who admitted them.
          </p>
        </div>
        <Button variant="primary" onClick={() => setAdding(true)}>
          Add officer
        </Button>
      </header>

      <ErrorMessage message={error} onRetry={officers.length === 0 ? load : undefined} />

      {notice && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-surface px-4 py-3">
          <p className="text-sm text-ink">{notice}</p>
          <Button variant="ghost" onClick={() => setNotice('')}>
            Dismiss
          </Button>
        </div>
      )}

      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            id="officerSearch"
            label="Search"
            placeholder="Name or email"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Select
            id="roleFilter"
            label="Role"
            placeholder="All roles"
            value={role}
            onChange={(event) => setFilter('role', event.target.value)}
            options={OFFICER_ROLES.map((value) => ({ value, label: value }))}
          />
          <Select
            id="statusFilter"
            label="Status"
            placeholder="Active and deactivated"
            value={isActive}
            onChange={(event) => setFilter('isActive', event.target.value)}
            options={ACTIVE_FILTERS}
          />
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading officers" />
      ) : officers.length === 0 ? (
        <Card>
          <EmptyState
            title="No officers match"
            description="Try clearing a filter or widening the search."
          />
        </Card>
      ) : (
        <section className="rounded border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Name</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Email</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">MOH area</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Role</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Status</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-ink-muted">Added by</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-ink-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {officers.map((item) => {
                  const isSelf = item.id === currentOfficer?.id

                  return (
                    <tr key={item.id} className="border-b border-line last:border-0 align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{item.fullName}</p>
                        {isSelf && <p className="mt-0.5 text-xs text-ink-subtle">You</p>}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{item.email}</td>
                      <td className="px-4 py-3 text-ink-muted">{item.mohArea || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge tone={item.role === 'Admin' ? 'accent' : 'neutral'}>
                          {item.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={item.isActive ? 'solid' : 'danger'}>
                          {item.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-muted">
                        {item.createdByName ?? 'Seeded'}
                        <span className="block text-ink-subtle">{formatDate(item.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant={item.isActive ? 'danger' : 'secondary'}
                          onClick={() => setPendingToggle(item)}
                          disabled={isSelf && item.isActive}
                        >
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            totalCount={result.totalCount}
            totalPages={result.totalPages}
            onPageChange={setPage}
          />
        </section>
      )}

      <AddOfficerModal
        open={adding}
        onClose={() => setAdding(false)}
        onCreated={(created) => {
          setNotice(`${created.fullName} can now sign in.`)
          load()
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        title={
          pendingToggle?.isActive
            ? `Deactivate ${pendingToggle?.fullName}?`
            : `Activate ${pendingToggle?.fullName}?`
        }
        description={
          pendingToggle?.isActive
            ? 'They will not be able to sign in. Everything they have recorded stays in place, and you can activate them again later.'
            : 'They will be able to sign in again with their existing password.'
        }
        confirmLabel={pendingToggle?.isActive ? 'Deactivate' : 'Activate'}
        loading={toggling}
        onConfirm={confirmToggle}
        onCancel={() => setPendingToggle(null)}
      />
    </div>
  )
}
