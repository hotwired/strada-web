const { userAgent } = window.navigator

export const isStradaNativeApp = /bridge-components: \[.+\]/.test(userAgent)
