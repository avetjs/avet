import { resolve } from 'path'
import del from 'del'

export default function clean (dir, distDir) {
  return del(resolve(dir, distDir))
}
