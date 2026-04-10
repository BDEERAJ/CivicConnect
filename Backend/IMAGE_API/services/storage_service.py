import gridfs

class MongoStorageService:
    def __init__(self, fs: gridfs.GridFS):
        self.fs = fs

    def get_file_by_name(self, filename: str):
        return self.fs.find_one({"filename": filename})

    def save_file(self, file_data: bytes, filename: str):
        file = self.fs.find_one({"filename": filename})
        
        if file:
            self.fs.delete(file._id)  # remove old file
        
        return self.fs.put(
            file_data,
            filename=filename,
            content_type="image/jpeg"
        )