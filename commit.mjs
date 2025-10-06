import childProcess from 'child_process'

try {
  const [, , commitTitle] = process.argv
  childProcess.execSync(
    `git pull && git add . && git commit -m "${commitTitle || new Date().toLocaleString()}" && git push`,
    {
      stdio: 'inherit',
    },
  )
} catch (error) {
  console.log('error: ', error)
}
