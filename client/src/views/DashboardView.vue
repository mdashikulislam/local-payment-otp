<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">OTP Messages</h1>
        <span class="message-count">{{ otpList.length }} Messages</span>
      </div>
    </div>

    <div class="otp-container">
      <div v-for="(otp, index) in otpList" :key="otp.id" class="otp-row">
        <div class="row-number">{{ index + 1 }}</div>
        <div class="sender-badge" :class="getProviderBadgeClass(otp.sender)">
          {{ getProviderName(otp.sender) }}
        </div>
        <div class="message-content">{{ otp.message }}</div>
        <div 
          class="otp-display" 
          @click="copyToClipboard(otp.otp, otp.id)"
          @mouseenter="hoveredId = otp.id"
          @mouseleave="hoveredId = null"
        >
          <span class="otp-text">{{ otp.otp }}</span>
          <span class="copy-hint" :class="{ 'show': hoveredId === otp.id || copiedId === otp.id }">
            {{ copiedId === otp.id ? 'Copied!' : 'Click to copy' }}
          </span>
        </div>
        <div class="timestamp">{{ formatTime(otp.created_at) }}</div>
      </div>

      <div v-if="otpList.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No OTP messages received yet</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../services/api'

const otpList = ref([])
const copiedId = ref(null)

const fetchOTPs = async () => {
  try {
    const { data } = await api.get('/otps')
    otpList.value = data.otps || []
  } catch (err) {
    otpList.value = []
  }
}

const copyToClipboard = async (otp, id) => {
  try {
    await navigator.clipboard.writeText(otp)
    copiedId.value = id
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const getProviderName = (sender) => {
  const senderUpper = sender.toUpperCase()
  if (senderUpper === 'BKASH') return 'bKash'
  if (senderUpper === 'NAGAD') return 'NAGAD'
  if (senderUpper === 'NRB BANK') return 'NRB BANK'
  if (sender === '16216') return 'DBBL'
  if (senderUpper === 'UPAY') return 'upay'
  return sender
}

const getProviderBadgeClass = (sender) => {
  const name = getProviderName(sender)
  const classes = {
    'bKash': 'badge-bkash',
    'NAGAD': 'badge-nagad',
    'NRB BANK': 'badge-nrb',
    'DBBL': 'badge-dbbl',
    'upay': 'badge-upay'
  }
  return classes[name] || 'badge-default'
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

onMounted(() => {
  fetchOTPs()
  setInterval(fetchOTPs, 5000)
})
</script>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 12px;
}

.dashboard-header {
  max-width: 1000px;
  margin: 0 auto 12px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.dashboard-title {
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.message-count {
  background: #6b7280;
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.otp-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.otp-row {
  display: grid;
  grid-template-columns: 30px 90px 1fr 90px 70px;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 4px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
}

.row-number {
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.sender-badge {
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 0.6rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-bkash { background: #d12053; color: #fff; }
.badge-nagad { background: #f7941d; color: #000; }
.badge-nrb { background: #00a8e8; color: #fff; }
.badge-dbbl { background: #10b981; color: #fff; }
.badge-upay { background: #6366f1; color: #fff; }
.badge-default { background: #f3f4f6; color: #6b7280; }

.message-content {
  color: #4b5563;
  font-size: 0.8rem;
  line-height: 1.3;
  word-break: break-word;
}

.otp-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px;
}

.otp-text {
  color: #dc2626;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: monospace;
  background: #fef2f2;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #fecaca;
}

.otp-display:hover .otp-text {
  background: #fee2e2;
  border-color: #dc2626;
}

.copy-hint {
  font-size: 0.65rem;
  color: #6b7280;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.copy-hint.show {
  opacity: 1;
}

.timestamp {
  color: #9ca3af;
  font-size: 0.7rem;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 32px 20px;
  color: #9ca3af;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .otp-row {
    grid-template-columns: 70px 1fr 80px;
    gap: 8px;
    padding: 8px 10px;
  }
  
  .row-number,
  .timestamp {
    display: none;
  }
}
</style>

