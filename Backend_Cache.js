// 🛡️ DYNAMIC CACHE CHUNKING ENGINE
function putCachedChunked(cache, key, value, timeInSeconds) {
  const chunkSize = 90000;
  let chunks = Math.ceil(value.length / chunkSize);
  cache.put(key, chunks.toString(), timeInSeconds);
  for (let i = 0; i < chunks; i++) {
    cache.put(key + "_" + i, value.substring(i * chunkSize, (i + 1) * chunkSize), timeInSeconds);
  }
}

function getCachedChunked(cache, key) {
  let chunksStr = cache.get(key);
  if (!chunksStr) return null;
  let chunks = parseInt(chunksStr, 10);
  let result = "";
  for (let i = 0; i < chunks; i++) {
    let chunk = cache.get(key + "_" + i);
    if (!chunk) return null;
    result += chunk;
  }
  return result;
}

// Updates the existing cache memory and moves it to a new timestamp instantly to bypass full sheet reads
function surgicalCacheMigration(callbackUpdateLogic) {
  const cache = CacheService.getScriptCache();
  const oldTs = PropertiesService.getScriptProperties().getProperty('GLOBAL_LAST_UPDATE') || "0";

  let c1 = getCachedChunked(cache, "CLI_" + oldTs);
  let c2 = getCachedChunked(cache, "PROJ_" + oldTs);
  let c3 = getCachedChunked(cache, "SERV_" + oldTs);

  let newTs = new Date().getTime().toString();

  // If the cache exists, surgically update it instead of destroying it
  if (c1 && c2 && c3) {
    try {
      let clients = JSON.parse(c1);
      let projects = JSON.parse(c2);
      let services = JSON.parse(c3);

      // Apply the surgical update to the memory arrays
      if (callbackUpdateLogic) {
        callbackUpdateLogic(projects, clients, services);
      }

      // Save directly to the new timestamp lock
      putCachedChunked(cache, "CLI_" + newTs, JSON.stringify(clients), 21600);
      putCachedChunked(cache, "PROJ_" + newTs, JSON.stringify(projects), 21600);
      putCachedChunked(cache, "SERV_" + newTs, JSON.stringify(services), 21600);
    } catch(e) {
      console.error("Surgical cache parsing failed. Will gracefully rebuild naturally on next load.", e);
    }
  }

  // Set the new global lock ID so the frontend knows the operation succeeded
  PropertiesService.getScriptProperties().setProperty('GLOBAL_LAST_UPDATE', newTs);
  return newTs;
}