<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">OTP Messages</h1>
        <span class="message-count">{{ otpList.length }} Messages</span>
      </div>
    </div>
    <div class="otp-container">
      <div v-for="(otp, index) in otpList" :key="otp.id" class="otp-card">
        <div class="card-header-row">
          <div class="sender-info">
            <span class="sender-badge" :class="getProviderBadgeClass(otp.sender)">
              {{ getProviderName(otp.sender) }}
            </span>
            <span class="timestamp">{{ formatTime(otp.created_at) }}</span>
          </div>
          <div class="otp-section">
            <span class="otp-code">{{ otp.otp }}</span>
            <button 
              class="copy-btn"
              @click="copyToClipboard(otp.otp, otp.id)"
              :class="{ 'copied': copiedId === otp.id }"
            >
              <svg v-if="copiedId !== otp.id" class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <svg v-else class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="tooltip" :class="{ 'show': copiedId === otp.id }">Copied!</span>
            </button>
          </div>
        </div>
        <div class="message-block">
          <code>{{ otp.message }}</code>
        </div>
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
  background: #f3f4f6;
  padding: 16px;
}

.dashboard-header {
  width: 80%;
  margin: 0 auto 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.dashboard-title {
  color: #1f2937;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.message-count {
  background: #4b5563;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.otp-container {
  width: 80%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.otp-card {
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sender-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-bkash { background: #d12053; color: #fff; }
.badge-nagad { background: #f7941d; color: #000; }
.badge-nrb { background: #00a8e8; color: #fff; }
.badge-dbbl { background: #10b981; color: #fff; }
.badge-upay { background: #6366f1; color: #fff; }
.badge-default { background: #e5e7eb; color: #6b7280; }

.timestamp {
  color: #9ca3af;
  font-size: 0.75rem;
}

.otp-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.otp-code {
  color: #dc2626;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 3px;
  font-family: 'SF Mono', Monaco, monospace;
}

.copy-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #e5e7eb;
}

.copy-btn.copied {
  background: #dcfce7;
}

.copy-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.copy-btn:hover .copy-icon {
  color: #374151;
}

.copy-btn.copied .copy-icon {
  color: #16a34a;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  background: #1f2937;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1f2937;
}

.tooltip.show {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-4px);
}

.message-block {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
}

.message-block code {
  display: block;
  color: #374151;
  font-size: 0.85rem;
  line-height: 1.5;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

@media (max-width: 640px) {
  .card-header-row {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .otp-box {
    order: -1;
    width: 100%;
    justify-content: space-between;
  }
}
</style>

