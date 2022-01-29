// 
// Welcome to FetchNode
//      - It's a script that parses Images from available sites given in the current features
//         $ danbooru
//         $ gelbooru
//

const prompt = require('prompt-sync') ({sigint: true}); // User Input

// Handle APIs
const danbooru = require('danbooru');
const req = require('booru')
const nsite = require('nhentai-node-api')

/* initialize the list */
const usablelist = ['danbooru', 'gelbooru', 'nhentai', 'rule34', 'paheal','dummy']
const listboorus = ['danbooru', 'gelbooru']

// Redundancy
const ax = require('axios').default;
const $$ = require('cheerio');

// Utils
const fs = require('fs')
const path = require('path')
const fetchimage = require('image-downloader');

var data = {
    
    PromptSite : null,
    SearchName : null,
    PostRating : null,
    PostLimit : null,
    PromptDownload : null,
    PromptFileLoc : null,
    PromptSequential : null,
    SetupFinish : false,
    CheckFinish : false

}

var LinkServed = [];
var LinkName = [];

function main() {
    
    initbruv();

}

const initbruv = async function() {

    Setup();

    if (!data.SetupFinish) return;

    await SanitizeInputs();

    console.log(data);

}

function Setup() {

    data.PromptSite = prompt('What Site To Parse Image From? ').trim().toLowerCase();

    data.SearchName = prompt('Search for? ');
    if (checkArray(data.PromptSite, listboorus) == true) {
        if (data.PromptSite == 'rule34') { /* lol */}
        else {
            data.PostRating = data.PromptSite == 'danbooru' ? prompt('1 - Safe | 2 - Questionable | 3 - Explicit: ') : prompt('1 - Safe | 2 - Questionable | 3 - Explicit | 4 - Unrated: ');
            data.PostRating = Number(data.PostRating.trim());
        }
    }
    data.PostLimit = prompt('How many Image/s you wanna parse? ');
    data.PromptDownload = prompt('Download locally? (Y / N) ').trim().toLowerCase();
    if (data.PromptDownload == 'y') {
        data.PromptFileLoc = prompt('Pathfile of the download: ').trim();
        data.PromptSequential = prompt('Sequential Download?  (Y / N) ').trim().toLowerCase();
        if (!directoryExists(data.PromptFileLoc)) {
            console.log('[ INVALID FILE PATH ]')
            Setup();
        }
    }

    return data.SetupFinish = true;
}

function directoryExists(fileloc) {
    var loc = path.dirname(fileloc)

    if (fs.existsSync(loc)) {
        return true;
    }

    else {
        return false;
    }
}

var imageindex = 0;
async function FetchURLDataMethod(siteurl, pathused, name) {

    const url = siteurl;
    const rpath = path.resolve(`${pathused}`, `${name}`)
    const patch = fs.createWriteStream(rpath)
  
    const response = await ax({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
    response.data.pipe(patch)
  
    return new Promise((resolve, reject) => {
      patch.on('finish', resolve)
      patch.on('error', reject)
    })
}

async function ImgDownloadWrapperMethod(siteurl, path, name) {

    const config = {
        url : siteurl,
        dest : `${path}\\${name}`,
        headers : { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.60' },
        timeout : 8000
    }

    await fetchimage.image(config)
        .then(({ filename }) => 
        {
            var status = data.PromptSequential == 'y' ? 'Finished Serving:' : 'Attempting to Download:'
            console.log(`${status} ${name}`)
            imageindex++
        })
        .catch((err) => console.error(err))
}

const SanitizeInputs = async () => {

    var inputclean = false;

    try {
        data.SearchName = data.SearchName.trim().toLowerCase().replace(/[ ]/g, '_');
        data.PostLimit = Number(data.PostLimit.trim());
        data.PromptDownload = data.PromptDownload.trim();
        inputclean = true;
    } catch {
        console.log('[ INVALID INPUT FOUND ]')
        Setup();
    }

    if (checkArray(data.PromptSite, usablelist) && inputclean) {
        data.CheckFinish = true;
        inputclean = false;
    }

    if (data.PostRating > 4) {
        console.log('[ INVALID RATING SETTING ]')
        Setup()
    }

    if (data.PostRating <= 4 && data.CheckFinish == true && checkArray(data.PromptSite, listboorus)) {

        if (data.PromptSite == 'danbooru') 
        {
            switch(data.PostRating) {
                
                case 1:
                    data.PostRating = 'rating:safe'
                    break;
                
                case 2:
                    data.PostRating = 'rating:questionable'
                    break;
        
                case 3:
                    data.PostRating = 'rating:explicit'
                    break;

                case 4:
                    data.PostRating = ''
                    break;
            }
        }

        else {
            switch(data.PostRating) {
                
                case 1:
                    data.PostRating = 'rating:safe'
                    break;
                
                case 2:
                    data.PostRating = 'rating:questionable'
                    break;
        
                case 3:
                    data.PostRating = 'rating:explicit'
                    break;

                case 4:
                    data.PostRating = ''
                    break;
            }
        }

        ServeSite();

    }

    else if (data.CheckFinish == true && !checkArray(data.PromptSite, listboorus)) {
        data.PostRating = ''
        ServeSite();
    }

    else if (data.CheckFinish == false) {
        console.log('[ INVALID SITE CHOICE ] \n')
        Setup()
    }

    else {
        console.log('Something Went Wrong ... \n')
        Setup()
    }

}
var found = false;
function checkArray(stringcheck, arr) {

    for (var i = 0; usablelist.length > i; i++) {

        const _arr = arr

        if (`${stringcheck}` == `${_arr[i]}`) {
            found = true;
        }

        else if (usablelist.length == i){ console.log('Check Array None'); return false; }
    }

    if (found) {
        found = false;
        return true;
    }
    return false;
}

const ServeSite = async () => {

    switch (data.PromptSite) {

        case 'danbooru':
            getresultdan();
            break;

        case 'nhentai':
            //getresultnh();
            break;

        case 'dummy':
            console.log('ugh you can be my lil pogchamp')
            break;

        default:
            ParseBooruResults();
    }
}


const getresultdan = async () => {
    const dbr = new danbooru()
    const config = 
    {
        limit : (100 + data.PostLimit),
        tags : `${data.SearchName} ${data.PostRating}`,
    }

    var time = new Date();

    var hours = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds();

    const cachedposts = await dbr.posts(config)
        .then(posts => {

            try {

                console.log(`( Attempting to Get Links Now ... ) [ DB API ]`)

                for (var i = 0; data.PostLimit > i; i++) {
    
                    const invalid = 'https://danbooru.donmai.us/'
        
                    if (LinkServed.length == i) {
        
                        const index = Math.floor(Math.random() * posts.length)
                        const post = posts[index]
                
                        const url = dbr.url(post.file_url);
                        const name = `${post.md5}.${post.file_ext}`
                        const shref = url.href

                        if (shref == invalid || `${post.file_ext}` == 'mp4' || `${post.md5}` == 'undefined') { console.log('blocked an invalid file'); --i; }

                        else //if (shref != invalid || `${post.file_ext}` != 'mp4' || `${name}` != 'undefined.png') 
                        {
                            LinkServed.push(shref);
                            LinkName.push(`danbooru_${name}`)
                            if (data.PromptDownload == 'n')
                            {
                                console.log(`${LinkServed[i]} - ${name}`);
                            }
                        }

                    }
                }
    
                if (LinkServed.length == data.PostLimit) 
                {
                    console.log(`[ LINKS SERVED - ${hours}:${minutes}:${seconds} ] (${LinkServed.length})`)
                    if (data.PromptDownload == 'y')
                    {
                        console.log(`( Attempting to Download Parsed Data Now ... )`)
                    }

                }
                
            } catch {
                console.log('\nSomething Went Wrong ... [ Invalid Name Search / API Hook no response ] \n')
                Setup();
            }
        })

    if (LinkServed.length == data.PostLimit) { 
        WriteImage()
    }
}

const ParseBooruResults = async () => {
    const config = 
    {
        limit : (100 + data.PostLimit),
        rating : `${data.PostRating}`
    }

    var time = new Date();

    var hours = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds();

    var tags = data.SearchName.split(' ')
    tags.push(data.PostRating)
    
    await req.search(`${data.PromptSite}`, tags, config)
        .then(posts => {
            try {

                console.log(`( Attempting to Get Links Now ... ) [ REQ API ]`)

                for (var k = 0; data.PostLimit > k; k++) {

                    if (LinkServed.length == k) {
                        const index = Math.floor(Math.random() * posts.length)
                        const post = posts[index]

                        const url = post.fileUrl
                        const urlpath = url.split('/')
                        var name = urlpath[urlpath.length - 1].replace(/[%]/g, '_')
                        var ext = name.split('.')
                        const _ext = ext[1]

                        const id = ext[0]


                        var sitename = data.PromptSite.split('.')
                        const _sitename = sitename[0]

                        
                        if (_ext == 'mp4' || id == `undefined`) { --k; }
                        
                        else 
                        {
                            LinkServed.push(url)
                            LinkName.push(`${_sitename}_${name}`)
                            if (data.PromptDownload == 'n')
                            {
                                console.log(`${LinkServed[k]} - ${name}`);
                            }
                        }
                    }
                }
                if (LinkServed.length == data.PostLimit) 
                {
                    console.log(`[ LINKS SERVED - ${hours}:${minutes}:${seconds} ] (${LinkServed.length})`)
                    //console.log(posts)
                    if (data.PromptDownload == 'y')
                    {
                        console.log(`( Attempting to Download Parsed Data Now ... )`)
                    }

                }

            }  catch 
                {
                    console.log('\nSomething Went Wrong ... [ Invalid Name Search / API Hook no response ] \n')
                    //Setup();
                }
        });

    if (LinkServed.length == data.PostLimit) { 
        WriteImage()
    }
}

const WriteImage = async () => {
    var time = new Date();

    var hours = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds();

    if (data.PromptDownload == 'n') return;

    for (var j = 0; LinkServed.length > j; j++) {
        data.PromptSequential == 'y' ? await ImgDownloadWrapperMethod(LinkServed[j], data.PromptFileLoc, LinkName[j]) : ImgDownloadWrapperMethod(LinkServed[j], data.PromptFileLoc, LinkName[j])
        //console.log(`${imageindex}`)
    }

    if (imageindex == data.PostLimit) {
        console.log(`[ Served Downloads - ${hours}:${minutes}:${seconds} ] (${imageindex}) \n`)
        //reset(3);
    }

    if (imageindex != data.PostLimit) {

        console.log('[ STARTING REDUNDANCY WRITE ]')

        const leftindex = LinkServed.splice(0, imageindex)
        const leftname = LinkName.splice(0, imageindex)
        let coat = leftindex[1];
        let jacket = leftname[1];

        var attempt = null;

        try 
        {
            for (var j = 0; coat.length > j; j++) {
                await FetchURLDataMethod(coat[j], data.PromptFileLoc, jacket[j])
                .then(() => 
                {
                    console.log(`[ Redundancy Write ] Finished Serving: ${jacket[j]}`)
                })
                .catch(console.log(`[ Request Failed / Timed-out ] ${jacket[j]}`))
                attempt = jacket[j]

            }
        } catch {
            console.log(`${attempt} failed to write`)
        }

    }

}

function reset(mode_index) { // data , link , all (integer)

    if (mode_index > 3) return;

    switch (mode_index) {

        case 1: case 3:
            data.PromptSite = null
            data.SearchName = null
            data.PostRating = null
            data.PostLimit = null
            data.PromptDownload = null
            data.PromptFileLoc = null
            data.SetupFinish = false;
            data.CheckFinish = false;
            break;

        case 2: case 3:
            LinkServed = []
            break;

    }
}

main();