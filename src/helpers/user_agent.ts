const { userAgent } = window.navigator

export const isStradaMobileApp = /bridge-components: \[.+\]/.test(userAgent)