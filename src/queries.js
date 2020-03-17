import $ from 'jquery'

const saveDocument = (data, callback) => {
    $.ajax({
        type: "POST",
        url: '/save_document',
        contentType: 'application/json',
        data: JSON.stringify(data),
        processData: false,
        success: (res) => {
            callback(JSON.parse(res))
        }
    })
}

const getDocumentsList = (callback) => {
    $.ajax({
        type: "get",
        url: '/get_documents_list',
        contentType: 'application/json',
        success: (res) => {
            const arr = JSON.parse(res)
            callback(arr)
        }
    })
}

const updateDocument = (obj, callback) => {
    $.ajax({
        type: "POST",
        url: '/update_document',
        contentType: 'application/json',
        data: JSON.stringify(obj),
        processData: false,
        success: (res) => {
            callback(JSON.parse(res))
        }
    })
}

export default { saveDocument, getDocumentsList, updateDocument }