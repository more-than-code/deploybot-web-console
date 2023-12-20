export type ParamsType = {
  [k: string]: string
}

export function SubmitViaForm(action: string, method: string, params: ParamsType) {
  const form = document.createElement('form')
  form.method = method
  form.action = action

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input')
      hiddenField.type = 'hidden'
      hiddenField.name = key
      hiddenField.value = params[key]

      form.appendChild(hiddenField)
    }
  }

  document.body.appendChild(form)
  form.submit()
}

export function obj2Arr(obj: any): string[] {
  if (!obj || obj === '') return []

  return Object.keys(obj).map(key => `${key}=${obj[key]}`)
}

export function arr2Obj(arr: string[]): object {
  if (!arr || arr.length === 0) return {}

  const obj: any = {}

  arr.forEach(item => {
    const [key, value] = item.split('=')
    obj[key] = value
  })

  return obj
}

export function transformCameCase<T>(data: T): T {
  if (!data) return data

  for (const key in data) {
    const value = data[key]

    if (isFirstLetterUpperCase(key)) {
      const lowerKey = lowerFirstLetter(key)
      data[lowerKey] = value

      delete data[key]
    }
  }

  return data
}

function lowerFirstLetter(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function isFirstLetterUpperCase(str: string): boolean {
  const firstLetter = str.charAt(0)

  return firstLetter === firstLetter.toUpperCase()
}