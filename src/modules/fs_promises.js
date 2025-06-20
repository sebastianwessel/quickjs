export default `
import { resolve as pathResolve } from 'node:path'

export const access = (path, mode) => new Promise((resolve, reject) => {
    try {
        __fs.accessSync(pathResolve(path), mode)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const appendFile = (path, data, options) => new Promise((resolve, reject) => {
    __fs.appendFile(pathResolve(path), data, options, (err) => {
        if (err) {
            reject(err)
        } else {
            resolve()
        }
    })
})

export const chmod = (path, mode) => new Promise((resolve, reject) => {
    try {
        __fs.chmodSync(pathResolve(path), mode)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const chown = (path, uid, gid) => new Promise((resolve, reject) => {
    try {
        __fs.chownSync(pathResolve(path), uid, gid)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const close = (fd) => new Promise((resolve, reject) => {
    __fs.close(fd, (err) => {
        if (err) {
            reject(err)
        } else {
            resolve()
        }
    })
})

export const copyFile = (src, dest, mode) => new Promise((resolve, reject) => {
    __fs.copyFile(pathResolve(src), pathResolve(dest), mode, (err) => {
        if (err) {
            reject(err)
        } else {
            resolve()
        }
    })
})

export const createReadStream = (...params) => __fs.createReadStream(...params)
export const createWriteStream = (...params) => __fs.createWriteStream(...params)

export const exists = (path) => new Promise((resolve) => {
    __fs.exists(pathResolve(path), (exists) => {
        resolve(exists)
    })
})

export const fchmod = (path, mode) => new Promise((resolve, reject) => {
    try {
        __fs.fchmodSync(pathResolve(path), mode)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const fchown = (path, uid, gid) => new Promise((resolve, reject) => {
    try {
        __fs.fchownSync(pathResolve(path), uid, gid)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const fdatasync = (fd) => new Promise((resolve, reject) => {
    __fs.fdatasync(fd, (err) => {
        if (err) {
            reject(err)
        } else {
            resolve()
        }
    })
})

export const fstat = (path) => new Promise((resolve, reject) => {
    try {
        const stats = __fs.fstatSync(pathResolve(path))
        resolve(stats)
    } catch (err) {
        reject(err)
    }
})

export const fsync = (fd) => new Promise((resolve, reject) => {
    __fs.fsync(fd, (err) => {
        if (err) {
            reject(err)
        } else {
            resolve()
        }
    })
})

export const ftruncate = (fd, len) => new Promise((resolve, reject) => {
    try {
        __fs.ftruncateSync(fd, len)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const futimes = (fd, atime, mtime) => new Promise((resolve, reject) => {
    try {
        __fs.futimesSync(fd, atime, mtime)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const lchmod = (path, mode) => new Promise((resolve, reject) => {
    try {
        __fs.lchmodSync(pathResolve(path), mode)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const lchown = (path, uid, gid) => new Promise((resolve, reject) => {
    try {
        __fs.lchownSync(pathResolve(path), uid, gid)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const link = (existingPath, newPath) => new Promise((resolve, reject) => {
    try {
        __fs.linkSync(pathResolve(existingPath), pathResolve(newPath))
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const lstat = (path) => new Promise((resolve, reject) => {
    try {
        const stats = __fs.lstatSync(pathResolve(path))
        resolve(stats)
    } catch (err) {
        reject(err)
    }
})

export const mkdir = (path, options) => new Promise((resolve, reject) => {
    try {
      const res = __fs.mkdirSync(pathResolve(path), options)
      resolve(res)
    } catch(err) {
      reject(err)
    }
})

export const mkdtemp = (prefix, options) => new Promise((resolve, reject) => {
    try {
      const res = __fs.mkdtempSync(prefix, options)
      resolve(res)
    } catch(err) {
      reject(err)
    }
})

export const open = (path, flags, mode) => new Promise((resolve, reject) => {
    __fs.open(pathResolve(path), flags, mode, (err, fd) => {
        if (err) {
            reject(err)
        } else {
            resolve(fd)
        }
    })
})

export const readdir = (path, options) => new Promise((resolve, reject) => {
    try {
      const res = __fs.readdirSync(pathResolve(path), options)
      resolve(res)
    } catch(err) {
      reject(err)
    }
})

export const read = (fd, buffer, offset, length, position) => new Promise((resolve, reject) => {
    __fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
        if (err) {
            reject(err)
        } else {
            resolve({ bytesRead, buffer })
        }
    })
})

export const readFile = (path, options) => new Promise((resolve, reject) => {
    try {
      const res = __fs.readFileSync(pathResolve(path), options)
      resolve(res)
    } catch (err) {
      reject(err)
    }
})

export const readlink = (path, options) => new Promise((resolve, reject) => {
    try {
        const linkString = __fs.readlinkSync(pathResolve(path), options)
        resolve(linkString)
    } catch (err) {
        reject(err)
    }
})

export const realpath = (path, options) => new Promise((resolve, reject) => {
    try {
        const resolvedPath = __fs.realpathSync(pathResolve(path), options)
        resolve(resolvedPath)
    } catch (err) {
        reject(err)
    }
})

export const rename = (oldPath, newPath) => new Promise((resolve, reject) => {
    __fs.rename(pathResolve(oldPath), pathResolve(newPath), (err) => {
        if (err) {
            reject(err)
        } else {
            resolve()
        }
    })
})

export const rmdir = (path) => new Promise((resolve, reject) => {
    try {
      const res = __fs.rmdirSync(pathResolve(path))
      resolve(res)
    } catch(err) {
      reject(err)
    }
})

export const stat = (path) => new Promise((resolve, reject) => {
    try {
        const stats = __fs.statSync(pathResolve(path))
        resolve(stats)
    } catch (err) {
        reject(err)
    }
})

export const symlink = (target, path, type) => new Promise((resolve, reject) => {
    try {
        __fs.symlinkSync(target, pathResolve(path), type)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const truncate = (path, len) => new Promise((resolve, reject) => {
    try {
        __fs.truncateSync(pathResolve(path), len)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const unlink = (path) => new Promise((resolve, reject) => {
    try {
        __fs.unlinkSync(pathResolve(path))
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const utimes = (path, atime, mtime) => new Promise((resolve, reject) => {
    try {
        __fs.utimesSync(pathResolve(path), atime, mtime)
        resolve()
    } catch (err) {
        reject(err)
    }
})

export const write = (fd, buffer, offset, length, position) => new Promise((resolve, reject) => {
    __fs.write(fd, buffer, offset, length, position, (err, written, buffer) => {
        if (err) {
            reject(err)
        } else {
            resolve({ written, buffer })
        }
    })
})

export const writeFile = (file, data, options) => new Promise((resolve, reject) => {
  try{
    const res = __fs.writeFileSync(pathResolve(file), data, options)
    return resolve(res)
  }catch(err) {
    return reject(err)
  }
 
})
`
