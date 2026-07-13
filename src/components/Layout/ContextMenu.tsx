import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, type LucideIcon } from 'lucide-react'

export interface ContextMenuItem
{
  // A separator is rendered when `separator` is true (other fields ignored).
  separator?: boolean
  label?: string
  icon?: LucideIcon
  onClick?: () => void
  danger?: boolean
  // Optional custom node rendered instead of a standard button (e.g. a color row).
  render?: () => React.ReactNode
  // When present, this item opens a nested submenu on hover instead of acting.
  submenu?: ContextMenuItem[]
  // Tree depth (1 = root level, 2 = first child, ...). Drives the guide lines
  // that make a "Move" folder tree read like a file explorer.
  indent?: number
}

export interface ContextMenuState
{
  x: number
  y: number
  items: ContextMenuItem[]
}

interface ContextMenuProps
{
  menu: ContextMenuState | null
  onClose: () => void
}

const INDENT = 16   // horizontal step per tree level
const BASE_PAD = 12 // left padding of the root level

// Renders the list of items for a menu (or submenu). Extracted so submenus reuse
// exactly the same rendering, including custom `render` rows and nested submenus.
// `depth` carries the tree depth so the indented "Move" tree shows guide lines.
const MenuItems: React.FC<{
  items: ContextMenuItem[]
  onClose: () => void
  depth?: number
}> = ({ items, onClose, depth = 1 }) =>
{
  // Which item index currently has its submenu open (hover).
  const [openSub, setOpenSub] = useState<number | null>(null)

  return (
    <>
      {items.map((item, i) =>
      {
        if (item.separator)
        {
          return <div key={i} className="my-1 border-t border-gray-100 dark:border-sepia-500" />
        }
        if (item.render)
        {
          return <div key={i}>{item.render()}</div>
        }
        const Icon = item.icon
        const itemIndent = item.indent ?? depth

        // Item that opens a nested submenu on hover.
        if (item.submenu)
        {
          return (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => setOpenSub(i)}
              onMouseLeave={() => setOpenSub((sub) => (sub === i ? null : sub))}
            >
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  openSub === i
                    ? 'bg-gray-100 dark:bg-sepia-700 text-gray-800 dark:text-sepia-50'
                    : 'text-gray-700 dark:text-sepia-100 hover:bg-gray-100 dark:hover:bg-sepia-800'
                }`}
                style={{ paddingLeft: 12 + (itemIndent - 1) * 18 }}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                <span className="truncate flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
              </button>

              <AnimatePresence>
                {openSub === i && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute top-0 left-full -ml-1 w-60 max-h-[70vh] overflow-y-auto bg-white dark:bg-sepia-900 rounded-xl shadow-2xl border border-gray-100 dark:border-sepia-500 p-1.5 z-10"
                  >
                    <TreeMenu items={item.submenu} onClose={onClose} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        }

        // Standard action item.
        return (
          <button
            key={i}
            onClick={() =>
            {
              item.onClick?.()
              onClose()
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
              item.danger
                ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                : 'text-gray-700 dark:text-sepia-100 hover:bg-gray-100 dark:hover:bg-sepia-800'
            }`}
            style={itemIndent > 1 ? { paddingLeft: 12 + (itemIndent - 1) * 18 } : undefined}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </>
  )
}

// Wrap each row in (indent - 1) nested divs, each with a left border, so the
// guide lines form a continuous tree (vertical rails per ancestor level). This
// is robust at any depth — no absolute positioning that can overlap or break.
const TreeMenu: React.FC<{
  items: ContextMenuItem[]
  onClose: () => void
}> = ({ items, onClose }) =>
{
  const renderTree = (rows: ContextMenuItem[], level: number): React.ReactNode =>
    rows.map((it, idx) => {
      const wrap = (node: React.ReactNode) =>
        level <= 1
          ? node
          : (
            <div key={idx} className="border-l border-gray-200 dark:border-sepia-500 pl-3">
              {node}
            </div>
          )
      return wrap(
        <MenuItems items={[it]} onClose={onClose} depth={level} />
      )
    })
  return <>{renderTree(items, 1)}</>
}


// A lightweight, reusable right-click menu. The parent owns the open state and
// passes the screen position plus the list of items to show.
const ContextMenu: React.FC<ContextMenuProps> = ({ menu, onClose }) =>
{
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Close on outside click, scroll or Escape.
  useEffect(() =>
  {
    if (!menu) return
    const onDown = (e: MouseEvent) =>
    {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) =>
    {
      if (e.key === 'Escape') onClose()
    }
    const onScroll = () => onClose()
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    // Lock the page scroll while the menu is open (feels native, like an OS menu).
    document.body.style.overflow = 'hidden'
    return () =>
    {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      document.body.style.overflow = ''
    }
  }, [menu, onClose])

  // Keep the menu inside the viewport.
  useEffect(() =>
  {
    if (!menu || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = Math.min(menu.x, window.innerWidth - rect.width - 8)
    const y = Math.min(menu.y, window.innerHeight - rect.height - 8)
    setPos({ x: Math.max(8, x), y: Math.max(8, y) })
  }, [menu])

  if (!menu) return null

  return (
    <div
      ref={ref}
      className="fixed z-[100] min-w-[14rem] bg-white dark:bg-sepia-900 rounded-xl shadow-2xl border border-gray-100 dark:border-sepia-500 p-1.5"
      style={{ left: pos.x, top: pos.y }}
    >
      <MenuItems items={menu.items} onClose={onClose} />
    </div>
  )
}

export default ContextMenu
