'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronsUpDown, Plus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface OrganizationOption {
  id: string | null
  name: string
  memberCount?: number
  isExisting: boolean
  isMember?: boolean
}

interface OrganizationComboboxProps {
  value: OrganizationOption | null
  onChange: (option: OrganizationOption) => void
  error?: string
  placeholder?: string
  disabled?: boolean
}

export function OrganizationCombobox({
  value,
  onChange,
  error,
  placeholder = 'Search or create organization...',
  disabled = false,
}: OrganizationComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<OrganizationOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Debounced search function
  const searchOrganizations = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/organizations/search?q=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        throw new Error('Failed to search organizations')
      }

      const data = await response.json()
      const results: OrganizationOption[] = data.map((org: any) => ({
        id: org.id,
        name: org.name,
        memberCount: org.member_count,
        isExisting: true,
        isMember: org.is_member,
      }))

      setSearchResults(results)
    } catch (error) {
      console.error('Error searching organizations:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchOrganizations(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchOrganizations])

  // Create "Create new" option
  const createNewOption: OrganizationOption = {
    id: null,
    name: searchQuery,
    isExisting: false,
  }

  const handleSelect = (option: OrganizationOption) => {
    onChange(option)
    setOpen(false)
  }

  const displayValue = value?.name || ''

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between',
              !displayValue && 'text-muted-foreground',
              error && 'border-red-500 focus:ring-red-500'
            )}
          >
            <span className="truncate">
              {displayValue || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type organization name..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No organizations found.
                    </div>
                  </CommandEmpty>

                  {/* Always show "Create new" option when there's a search query */}
                  {searchQuery.trim().length > 0 && (
                    <CommandGroup heading="Create New">
                      <CommandItem
                        value={`create-new-${searchQuery}`}
                        onSelect={() => handleSelect(createNewOption)}
                        className="cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4 text-green-600" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Create new: {searchQuery}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            You will be the owner
                          </span>
                        </div>
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            value?.name === searchQuery && !value?.isExisting
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    </CommandGroup>
                  )}

                  {/* Show existing organizations */}
                  {searchResults.length > 0 && (
                    <CommandGroup heading="Existing Organizations">
                      {searchResults.map((org) => (
                        <CommandItem
                          key={org.id}
                          value={org.id || ''}
                          onSelect={() => handleSelect(org)}
                          className="cursor-pointer"
                        >
                          <Users className="mr-2 h-4 w-4 text-blue-600" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium truncate">
                              {org.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {org.memberCount === 1
                                ? '1 member'
                                : `${org.memberCount} members`}
                              {org.isMember && ' • Already a member'}
                            </span>
                          </div>
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4 shrink-0',
                              value?.id === org.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
