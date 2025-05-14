import multer from "multer";
import path from "path";

//storage

const initUploader = ()=>{
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
    
            cb(null, path.join(__dirname,'..', 'uploads'));
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        },
    });
    return multer({ storage: storage });
}
export const uploader = initUploader()