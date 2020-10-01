const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"')
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number')
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

// userScheme.methodsオブジェクトにtoJSONプロパティ？を追加
userSchema.methods.toJSON = function () {
  const user = this
  // toObject()で操作しやすいオブジェクト形式に変換している？
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}
// token methodsはinstance methods
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}
// login staticsはmodle methods
userSchema.statics.findByCredentials = async (email, password) => {
  // 分割代入
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('Unable to login!')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Unable to login')
  }
  return user
}
// Hash the plain text password before saving
// middlewareで定義することで、今回の場合は『POST』『PATCH』の両メソッドに対して一度で記載が完了している
userSchema.pre('save', async function (next) {
  const user = this
  // isModified()：引数の文字列が変更された場合はtrueを返し、逆はfalse
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})

// 'User'をmodels/task.jsでもrefで使用している
const User = mongoose.model('User', userSchema)
module.exports = User
