const search = document.querySelector('#search-btn')
const appendHere = document.querySelector('#append-here')

let options = {
    filter:0,
    sort:0,
    type:0,
}

$('#select-sort').on('change',() => {
    options.sort = $('#select-sort').find(":selected").val()
    triggerSearch()
})

$('#select-filter').on('change',() => {
    options.filter = $('#select-filter').find(":selected").val()
    triggerSearch()
})

$('#select-type').on('change',() => {
    options.type = $('#select-type').find(":selected").val()
    triggerSearch()
})

search.addEventListener('click',(e) => {
    triggerSearch(true)
})

ipcRenderer.on('get:results',(data,e) => {
    createTable(data)
})

ipcRenderer.on('set:searchbar',(data,e) => {
    $('#search-input').val(data.path)
})

$('#append-here').on('click','.del-btn',(e) => {
    let file = $(e.target).attr('attr-file')
    deleteFile(file)
    console.log($('table tr').length)
    if ($('table tr').length === 2) {
        $(e.target).parents('table').remove()
    } else {
        $(e.target).parents('tr').remove()
    }
})

triggerSearch = (trigger=false) => {
    let dir = ''
    if ($('#search-input').val() !== ''){
        dir = $('#search-input').val()
    }
    ipcRenderer.send('select:location',{dir:dir,options:options,trigger:trigger})
    appendHere.innerHTML = '<img src="../assets/img/loading.gif" class="img-fluid w-100">'
}

createTable = (data) => {
    let html = '';
    if (data.res.length > 0) {
        html +='<table class="mt-5 table"><thead class="table-dark"><tr><th>#</th><th>Filename</th><th>File Size</th><th>Actions</th></tr></thead><tbody>'
        let i = 1
        data.res.forEach(element => {
            html += `<tr><td>${i}</td><td>${getIco(element.name)} ${element.name.replace($('#search-input').val()+'/','')}</td><td>${formatBytes(element.size)}</td><td><button attr-file="${element.name}" class="del-btn btn btn-sm btn-danger"><i class="fa fa-trash"></i></button></td></tr>`
            i++
        });
    
        html += '</tbody></table>'
    } else {
        html += '<img src="../assets/img/empty.png" class="img-fluid w-100">'
    }
    appendHere.innerHTML = html
}

deleteFile = (file) => {
    Swal.fire({
        icon:'warning',
        title: 'Do you want to continue?',
        showCancelButton: true,
        confirmButtonText: 'Delete',
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('File Deleted!', '', 'success')
            ipcRenderer.send('delete:file',{file:file})
        }
    })
}

getIco = (file) => '<i class="fa-solid fa-file fs-6 text-primary"></i> '

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }