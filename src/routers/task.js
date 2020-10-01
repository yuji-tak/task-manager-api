const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
// router
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch(e) {
    res.status(400).send(e)
  }
})
// GET /tasks?completed=true
// GET /tasks?limit=10&skip20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    // 右辺の厳密等価演算子の式がtrueの場合はtrueの値が左辺へ、逆も然り
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    // partsはArray
    const parts = req.query.sortBy.split(':')
    // sortオブジェクトにArrayから値を代入
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    // userとtaskを関連付ける処理
    await req.user.populate({
      // pathのvalue('tasks')でDBの関連づけるcollectionsを指定
      path: 'tasks',
      match,
      options: {
        // 検索クエリは常に文字列を返すので、型変換
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch(e) {
    res.status(500).send()
  }
})
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    // findOneの引数の2条件に合致した場合のみ、taskに値が代入される
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch(e) {
    res.status(500).send()
  }
})
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = [ 'description', 'completed' ]
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  const _id = req.params.id
  try {
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()
    res.send(task)
  } catch(e) {
    res.status(400).send(e)
  }
})
router.delete('/tasks/:id', auth, async (req, res) => {

  const _id = req.params.id
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  } catch(e) {
    res.status(500).send()
  }
})

module.exports = router
