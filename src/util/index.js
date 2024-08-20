const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

const getDeliveryDate = () => {
  console.log('Calling getDeliveryDate() tool...')
  const deliveryDate = getRandomDate(new Date(2025, 0, 1), new Date(2026, 0, 1))
  return deliveryDate
}

module.exports = {
  getDeliveryDate,
}