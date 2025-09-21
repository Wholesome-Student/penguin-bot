function selectWeightedRandom(objectList, weightKey) {
  if (!Array.isArray(objectList) || objectList.length === 0) {
    return null;
  }

  const totalWeight = objectList.reduce((sum, item) => {
    const weight = item[weightKey];
    return sum + (typeof weight === "number" && weight > 0 ? weight : 0);
  }, 0);

  if (totalWeight <= 0) {
    return null;
  }
  let randomValue = Math.random() * totalWeight;
  for (const object of objectList) {
    const weight = object[weightKey];
    if (typeof weight !== "number" || weight <= 0) {
      continue;
    }
    randomValue -= weight;
    if (randomValue <= 0) {
      return object;
    }
  }

  return null;
}

module.exports = { selectWeightedRandom };