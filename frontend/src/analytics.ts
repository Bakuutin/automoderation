import ReactGA from 'react-ga'
import { Store, Action } from 'redux'
import { Reducer } from 'react'
import { RouterAction, LOCATION_CHANGE } from 'connected-react-router'

const options = {}

const trackPage = (page: string) => {
    ReactGA.set({
        page,
        ...options
    })
    ReactGA.pageview(page)
}

let currentPage = ''

export const googleAnalytics = (store: Store) => (next: any) => (action: RouterAction) => {
  if (action.type === LOCATION_CHANGE) {
    const nextPage = `${action.payload.location.pathname}${action.payload.location.search}`

    if (currentPage !== nextPage) {
      currentPage = nextPage
      trackPage(nextPage)
    }
  }

  return next(action)
}
