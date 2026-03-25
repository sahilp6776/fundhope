// Master seed script to populate database with all demo data
const { spawn } = require('child_process')
const path = require('path')

console.log('\n')
console.log('╔════════════════════════════════════════════════════════╗')
console.log('║         🌱 FundHope Database Seeding Suite 🌱          ║')
console.log('╚════════════════════════════════════════════════════════╝')
console.log('\n')

const scripts = [
  {
    name: 'Users & Donations',
    file: 'seedDemoDonationsAndUsers.js',
    description: 'Creates 25 demo users and 80+ donations'
  },
  {
    name: 'Notifications',
    file: 'seedNotifications.js',
    description: 'Creates notifications for users'
  },
  {
    name: 'Activity Logs',
    file: 'seedActivityLogs.js',
    description: 'Creates activity logs for campaigns'
  },
]

let currentIndex = 0

const runNextScript = () => {
  if (currentIndex >= scripts.length) {
    console.log('\n')
    console.log('╔════════════════════════════════════════════════════════╗')
    console.log('║              ✅ All Seeding Complete! ✅              ║')
    console.log('╚════════════════════════════════════════════════════════╝')
    console.log('\n📊 Summary:')
    console.log('   ✅ 25 demo users created')
    console.log('   ✅ 80+ demo donations created')
    console.log('   ✅ Notifications generated')
    console.log('   ✅ Activity logs created')
    console.log('\n🎉 Database is now ready for testing!\n')
    process.exit(0)
  }

  const script = scripts[currentIndex]
  console.log(`\n📌 Step ${currentIndex + 1}/${scripts.length}: ${script.name}`)
  console.log(`   ${script.description}`)
  console.log('─'.repeat(56))

  const child = spawn('node', [path.join(__dirname, script.file)], {
    stdio: 'inherit',
    shell: true
  })

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`\n❌ ${script.name} seeding failed!`)
      process.exit(1)
    }
    currentIndex++
    runNextScript()
  })

  child.on('error', (err) => {
    console.error(`\n❌ Error running ${script.file}:`, err)
    process.exit(1)
  })
}

runNextScript()
