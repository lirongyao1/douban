const Router = require('koa-router')
const _ = require('lodash')
const glob = require('glob')
const path = require('path')

// const Movies = require('../model/Movies')
// const Categories = require('../model/Categories')
// const Users = require('../model/Users')

const symbolPrefix = Symbol('prefix')
const routerMap = new Map()

const isArray = c => _.isArray(c) ? c : [c]

export class Route {
  constructor (app, apiPath) {
    this.app = app
    this.apiPath = apiPath
    this.router = new Router()
  }

  init () {
    glob.sync(path.resolve(this.apiPath, './**/*.js')).forEach(require)

    for (let [conf, controller] of routerMap) {
      const controllers = isArray(controller)
      let prefixPath = conf.target[symbolPrefix]
      if (prefixPath) {
        prefixPath = normalizePath(prefixPath)
      }
      const routerPath = prefixPath + conf.path
      this.router[conf.method](routerPath, ...controllers)
    }


    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods())
  }
}

export const normalizePath = path => path.startsWith('/') ? path : `/${path}`

export const router = conf => (target, key, descriptor) => {
  conf.path = normalizePath(conf.path)

  routerMap.set({
    target,
    ...conf
  }, target[key])

}

export const controller = path => target => (target.prototype[symbolPrefix] = path)

export const get = path => router({
  method: 'get',
  path: path
})

export const post = path => router({
  method: 'post',
  path: path
})

export const put = path => router({
  method: 'put',
  path: path
})

export const del = path => router({
  method: 'del',
  path: path
})

export const use = path => router({
  method: 'use',
  path: path
})

export const all = path => router({
  method: 'use',
  path: all
})