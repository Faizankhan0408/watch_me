import {asyncHandler} from "../utils/async_handler.js"


const registerUser=asyncHandler(async (req,res)=>{
     res.status(200).json({
        message:"ok bhai ho gaya"
    })
})

export {registerUser}