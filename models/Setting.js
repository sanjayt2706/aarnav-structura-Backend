import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "Aarnav Structura"
    },

    tagline: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    },

    alternatePhone: {
      type: String,
      default: ""
    },

    email: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    mapUrl: {
      type: String,
      default: ""
    },

    logo: {
      type: String,
      default: ""
    },

    favicon: {
      type: String,
      default: ""
    },

    heroTitle: {
      type: String,
      default: ""
    },

    heroSubtitle: {
      type: String,
      default: ""
    },

    aboutTitle: {
      type: String,
      default: ""
    },

    aboutDescription: {
      type: String,
      default: ""
    },

    facebook: String,
    instagram: String,
    linkedin: String,
    youtube: String,

    whatsapp: String
  },
  {
    timestamps: true
  }
);

const SettingModel = mongoose.model(
  "Setting",
  settingSchema
);

export const Setting = {

  async get() {

    let setting = await SettingModel.findOne();

    if (!setting)
      setting = await SettingModel.create({});

    return setting;

  },

  async update(data) {

    let setting = await SettingModel.findOne();

    if (!setting)
      setting = await SettingModel.create(data);

    else {

      Object.assign(setting, data);

      await setting.save();

    }

    return setting;

  }

};

export default SettingModel;