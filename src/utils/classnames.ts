type Value = string | number | boolean | undefined | null
type Mapping = Record<string, unknown>
type Argument = Value | Mapping | Array<Value | Mapping>

/**
 * Combines multiple class names into a single string
 * @param args - Class names or objects mapping class names to boolean conditions
 * @returns Combined class names string
 */
export function classNames(...args: Argument[]): string {
  const classes: string[] = []

  args.forEach((arg) => {
    if (!arg) return

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg.toString())
    } else if (Array.isArray(arg)) {
      const innerClasses = classNames(...arg)
      if (innerClasses) {
        classes.push(innerClasses)
      }
    } else if (typeof arg === 'object') {
      Object.entries(arg).forEach(([key, value]) => {
        if (value) {
          classes.push(key)
        }
      })
    }
  })

  return classes.filter(Boolean).join(' ')
}

export default classNames