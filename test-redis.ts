import { Redis } from '@upstash/redis'
import 'dotenv/config'

console.time('redis')
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

async function test() {
  try {
    const res = await redis.ping()
    console.log('Redis ping:', res)
    console.timeEnd('redis')
  } catch (error) {
    console.error('Redis error:', error)
  }
}

test()
