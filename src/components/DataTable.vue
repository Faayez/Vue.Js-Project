<template>
  <div>
    <code>query: {{ query }}</code>
    <datatable v-bind="$data" />
  </div>
</template>
<script>


export default {
  data: () => ({
    columns: [
      { title: 'User ID', field: 'uid', sortable: true },
      { title: 'Username', field: 'name' },
      { title: 'Age', field: 'age', sortable: true },
      { title: 'Email', field: 'email' },
      { title: 'Country', field: 'country' }
    ],
    data: [{uid: 1, name: 2, age: 3, email: 4, country: 5}],
    total: 0,
    query: {}
  }),
  watch: {
    query: {
      handler (query) {
          return new Promise((resolve, reject) => {
            this.data = rows
            this.total = total
          })
         
      },
      deep: true
    }
  }
}
</script>