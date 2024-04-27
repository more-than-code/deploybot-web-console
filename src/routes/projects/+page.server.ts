import type { ItemsResponse } from 'models/response'
import type { Project } from 'models/projects'
import type { PageServerLoad } from './$types'

export const load = (async ({ fetch, cookies }) => {
  const accessToken = cookies.get('accessToken')

  const res = await fetch('/api/projects', {
    method: 'GET'
  })

  if (res.status == 200) {
    const projRes: ItemsResponse<Project> = await res.json().catch((e) => console.error)
    return {
      projects: projRes.payload.items,
      accessToken
    }
  } else {
    console.info(res.status)
  }
}) satisfies PageServerLoad
