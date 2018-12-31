module.exports = status => {
  switch (status) {
    case 0:
    case '0':
    case 'off':
      return 'F0'
    case 'on':
      return 'F1'
    case 'low':
      return 'FdP8'
    case 'mid':
      return 'FdP16'
    case 'high':
      return 'FdP24'
    case 'full':
      return 'FdP32'
  }
  if (status > 0 && status <= 100) {
    return 'FdP' + Math.round(status * 0.32)
  }
  return 'F1' // assume anything else means "on"
}
