const { executable } = require('../../config')

// helper so I don't have to add the boilerplate each time
// cronBoilerPlate([foo, bar]) === `foo bash -etc 'bar' > /tmp/bar.out 2&! # comment`
module.exports = frequenceAndCommand => {
  const [frequency, rest] = frequenceAndCommand
  if (!rest) return `# ${frequency}`
  const [command, comment] = rest.split('#')
  const tempFile = command.replace(executable, '').trim().replace(/\W+/g, '-')
  return `${frequency} bash -l -c '${command}' > /tmp/${tempFile}.out 2>&1${comment ? ' # ' + comment : ''}`
}
