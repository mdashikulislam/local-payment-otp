<template>
  <div class="container py-4">
    <div class="row mb-4">
      <div class="col">
        <div class="p-4 bg-light rounded-3 border">
          <h1 class="h4 mb-1">Dashboard</h1>
          <p class="text-muted mb-0">Explore data below.</p>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header">Users</div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-3">Loading...</div>
            <div v-else>
              <table class="table table-sm align-middle">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-if="users.length === 0" class="text-muted">No users yet.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'

const users = ref([])
const loading = ref(true)

const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/users')
    users.value = data.users
  } catch (err) {
    users.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)
</script>

