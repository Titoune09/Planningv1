'use client'

import { Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentOrg } from '@/hooks/use-org'

export function OrgSelector() {
  const { currentOrgId, allMemberships, setOrg, isLoading } = useCurrentOrg()

  if (isLoading) {
    return <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
  }

  if (allMemberships.length === 0) {
    return null
  }

  return (
    <Select value={currentOrgId || undefined} onValueChange={setOrg}>
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder="Sélectionner une organisation" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {allMemberships.map((membership) => (
          <SelectItem key={membership.orgId} value={membership.orgId}>
            <div className="flex flex-col">
              <span>{membership.org.name}</span>
              <span className="text-xs text-muted-foreground">
                {membership.role === 'owner'
                  ? 'Propriétaire'
                  : membership.role === 'manager'
                  ? 'Manager'
                  : 'Employé'}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
