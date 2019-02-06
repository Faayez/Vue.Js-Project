const dateTimeFormats = {
    'en-US': {
      short: {
        year: 'numeric', month: 'short', day: 'numeric'
      },
      long: {
        year: 'numeric', month: 'short', day: 'numeric',
        weekday: 'short', hour: 'numeric', minute: 'numeric'
      }
    },
    'nl-NL': {
      short: {
        year: 'numeric', month: 'short', day: 'numeric'
      },
      long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true
      }
    }
  }

  export default {
      dateTimeFormats
  };