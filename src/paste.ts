import { db } from "./db";

export function generatePasteName() {
  const chars = 'abcdefgijklmnopqrstuvwxyz';
  const length = 10;
  let ret = '';

  for (let i = 0; i < length; i++) {
    ret += chars[Math.floor(Math.random() * chars.length)];
  }

  return ret;
}

export async function generateUniquePasteName() {
  let postId = generatePasteName();
  let used = true;
  while (used) {
    if (
      (await db.paste.count({
        where: { name: postId },
        take: 1
      })) === 0
    ) {
      used = false;
    } else {
      postId = generatePasteName();
    }
  }

  return postId;
}
