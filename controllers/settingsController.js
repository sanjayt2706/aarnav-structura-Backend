import { Setting } from "../models/Setting.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// GET /api/settings

export const getAllSettings = asyncHandler(async (req, res) => {

    const settings = await Setting.get();

    res.json({

        success:true,

        data:settings

    });

});

// GET /api/settings/:key

export const getSetting = asyncHandler(async (req,res)=>{

    const settings=await Setting.get();

    const value=settings[req.params.key];

    if(value===undefined){

        return res.status(404).json({

            success:false,

            message:"Setting not found"

        });

    }

    res.json({

        success:true,

        data:value

    });

});

// PUT /api/admin/settings/:key

export const upsertSetting=asyncHandler(async(req,res)=>{

    const settings=await Setting.get();

    settings[req.params.key]=req.body;

    await Setting.update(settings);

    res.json({

        success:true,

        message:`${req.params.key} updated successfully`

    });

});