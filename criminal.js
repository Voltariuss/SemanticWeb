const urlParams = new URLSearchParams(window.location.search);
const criminalId = urlParams.get('id');
const criminalURI = 'http://dbpedia.org/resource/' + criminalId;


const fields = [
    'name',
    'alias',
    'label',
    'criminalCharge',
    'convictionPenalty',
    'motive',
    'apprehended',
    'victims',
    'country',
    'birthDate',
    'birthPlace',
    'parents',
    'deathDate',
    'deathPlace',
    'comment',
    'occupation',
    'imageName'
]

const fieldTypes = [
    'str',
    'str',
    'str',
    'str',
    'resource',
    'str',
    'date',
    'str',
    'country',
    'date',
    'resource',
    'str',
    'date',
    'resource',
    'str',
    'resource',
    'image'
]

const predicates = [
    'foaf:name',
    'dbpedia2:alias',
    'rdfs:label',
    'dbo:criminalCharge',
    'dbo:convictionPenalty',
    'dbo:motive',
    'dbo:apprehended',
    'dbpedia2:victims',
    'dbo:country',
    'dbo:birthDate',
    'dbo:birthPlace',
    'dbpedia2:parents',
    'dbo:deathDate',
    'dbo:deathPlace',
    'rdfs:comment',
    'dbo:occupation',
    'dbpedia2:imageName'
]

$('#criminal_info_block').hide();
$('title').html(`${criminalId} - Web sémantique`);

$('#imageName').css('transform', 'rotate(' + ((Math.random() * 6) - 3) + 'deg)');
$('.paper').each((i, o) => {
    $(o).css('transform', 'rotate(' + ((Math.random() * 1.5) - 0.75) + 'deg)');
});

$('.def_blocks').each((i, o) => {
    o.innerHTML = '█'.repeat(Math.floor(Math.random() * 5) + 10);
});

$('.collapse-div').each(function () {
    const target = $(this).attr('data-target');
    $('#' + target).hide();
})

$('.collapse-div').click(function () {
    const target = $(this).attr('data-target');

    if ($('#' + target).css('display') === 'none') {
        $(this).find('.collapse-caret').css('transform', 'rotate(180deg)');
    } else {
        $(this).find('.collapse-caret').css('transform', 'rotate(0deg)');
    }

    $('#' + target).slideToggle();
    
    
});

const promises = predicates.map((p) => { return generateRequest(criminalURI, p) })
Promise.all(promises)
    .then(results => {
        // animation to show the criminal card
        $('#criminal_info_block').show();
        $('#criminal_info_loading').hide();
        $('#criminal_info').css('opacity', '0');
        $('#criminal_info').css('bottom', '-200px');
        $('#criminal_info').animate({
            bottom: 0,
            opacity: 1,
        }, {
            easing: 'swing'
        });

        // build dom
        buildDOM(results);
    })


function getResourceName(resource, def) {
    if (resource['name'] && resource['name']['value']) {
        return resource['name']['value'];
    } else if (resource['label']  && resource['label']['value']) {
        return resource['label']['value'];
    } else {
        const splitUrl = resource[def]['value'].split('/')
        return splitUrl[splitUrl.length - 1];
    }
}

function getResourceIdFromUri(uri) {
    const splitUri = uri.split('/');
    return splitUri[splitUri.length - 1];
}

function generateTableDisplay(criminals) {
    criminals.sort((a, b) => {
        return a['criminal']['value'] > b['criminal']['value'];
    })

    criminals.filter((item, pos) => {
        return criminals.indexOf(item) == pos;
    })

    let str = '<div class="container"><div class="row">';
    for (let c of criminals) {
        const target = getResourceIdFromUri(c['criminal']['value']);
        const randAngle = Math.random() * 4 - 2;
        const randTransX = Math.random() * 20 - 10;
        const randTransY = Math.random() * 10 - 5;
        str += '<div class="col-4 text-center my-2" style="transform: rotate(' + randAngle + 'deg) translate(' + randTransX + 'px, ' + randTransY + 'px);"><a href="criminal.html?id='+target+'"><div class="post-it p-2"><div class="post-it-name">' + getResourceName(c, 'criminal') + '</div></div></a></div>';
    }
    str += '</div>';

    return str;
}

function redirectToCriminal(id) {
    window.location.href = 'criminal.html?id=' + id;
}

function generateListDisplay(pieces) {
    let str = '<div class="container"><div class="row">';
    for (let piece of pieces) {
        for (let c of piece['results']['bindings']) {
            const target = getResourceIdFromUri(c['criminal']['value']);
            const randAngle = Math.random() * 4 - 2;

            const randTransX = Math.random() * 20 - 10;
            const randTransY = Math.random() * 10 - 5;
            str += '<div class="col-4 text-center my-2" style="transform: rotate(' + randAngle + 'deg) translate(' + randTransX + 'px, ' + randTransY + 'px);"><a href="criminal.html?id='+target+'"><div class="post-it p-2"><div class="post-it-name">' + getResourceName(c, 'criminal') + '</div><div class="criminal_charge_description">(' + c['value']['value'] + ')</div></div></a></div>';
        }
    }
    str += '</div></div>';

    return str;
}

function showSameApprehendedYear(criminal) {
    requestSameYear('dbo:apprehended', criminal.apprehended[0]['value'].split('-')[0], criminalURI).done((other) => {
        const str = generateTableDisplay(other['results']['bindings']);
        $('#same_apprehended_year_list').append(str);
        $('#same_apprehended_year').show();
        $('#same_apprehended_year_loading').hide();
    });
}


function showSameConvictionPenalty(criminal) {
    const promises = criminal.convictionPenalty
        .map(charge => requestSameURI('dbo:convictionPenalty', charge['value'], criminalURI));

    Promise.all(promises).then(data => {
        const str = generateTableDisplay(data.map(d => d['results']['bindings']).flat());

        $('#same_conviction_penalty_list').append(str);
        $('#same_conviction_penalty').show();
        $('#same_conviction_penalty_loading').hide();
    });
}

function showSimilarCriminalCharge(criminal) {

    const promises = criminal.criminalCharge[0]['value'].split(/[;.,()]/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(piece => {
            console.log(piece)
            return requestContainsText('dbo:criminalCharge', piece.toLowerCase(), criminalURI)
        });

    Promise.all(promises).then(pieces => {

        const str = generateListDisplay(pieces);

        $('#similar_criminal_charge_list').append(str);
        $('#similar_criminal_charge').show();
        $('#similar_criminal_charge_loading').hide();
    })

}

function showSimilarMotive(criminal) {
    const promises = criminal.motive[0]['value'].split(/[;.,()]/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(piece => {
            return requestContainsText('dbo:motive', piece.toLowerCase(), criminalURI)
        });

    Promise.all(promises).then(pieces => {
        const str = generateListDisplay(pieces);
        $('#similar_motive_list').append(str);
        $('#similar_motive').show();
        $('#similar_motive_loading').hide();
    });

}

function buildDOM(data) {
    console.log('buildDom');
    const criminal = {};

    for (let i = 0; i < fields.length; ++i) {
        criminal[fields[i]] = []
        const bindings = data[i]['results']['bindings'];

        // Si l'API a retourné une ligne
        if (bindings.length > 0) {
            for (let j = 0; j < bindings.length; ++j) {
                criminal[fields[i]].push(bindings[j]['value']);
            }

            // Suppression des lignes vides et/ou non anglaises
            criminal[fields[i]] = criminal[fields[i]].filter(item => {
                return item['value'] != '' && (item['xml:lang'] === undefined || item['xml:lang'] == 'en');
            });

            // Si l'API a retourné une ligne anglaise
            if (criminal[fields[i]][0] != undefined) {
                switch (fieldTypes[i]) {
                    case 'image':
                        const imgName = criminal[fields[i]][0]['value']
                        $('#' + fields[i]).html(`<img src="https://wikipedia.org/wiki/Special:FilePath/${imgName}" 
                                                        title="${imgName}" 
                                                        alt="${imgName}" 
                                                        class="${fields[i]} shadow rounded mx-auto d-block"/>`)
                        break;
                    case 'country':
                        for (let j = 0; j < criminal[fields[i]].length; ++j) {
                            console.log(criminal[fields[i]].length);

                            const countryUrl = criminal[fields[i]][j]['value'];
                            const splitCountryUrl = countryUrl.split('/');
                            const countryName = splitCountryUrl[splitCountryUrl.length - 1];
                            console.log(countryName);

                            $('#' + fields[i]).append(`<img src="https://wikipedia.org/wiki/Special:FilePath/Flag_of_${countryName}.svg" 
                                                            title="${countryName}" 
                                                            alt="${countryName}" 
                                                            height=18
                                                            class="flag"/>`)
                        }
                        break;
                    case 'date':
                        const date = criminal[fields[i]][0]['value'];
                        const year = date.substr(0, 4);
                        const month = date.substr(5, 2);
                        const day = date.substr(8, 2);
                        $('#' + fields[i]).html(`${day}/${month}/${year}`);
                        break;
                    case 'resource':
                        $('#' + fields[i]).html(criminal[fields[i]].map(e => getResourceIdFromUri(e['value'])).join(' / '));
                        Promise.all(criminal[fields[i]].map(e => requestResourceLabel(e['value']))).then(labels => {
                            labels = labels.map((l, i) => {
                                if (l['results']['bindings'].length == 0) {
                                    return getResourceIdFromUri(criminal[fields[i]][i]['value']);
                                } else {
                                    return getResourceName(l['results']['bindings'][0], 'resource');
                                }
                            });
                            $('#' + fields[i]).html(labels.join(' / '));
                        });
                        break;
                    default:
                        $('#' + fields[i]).html(criminal[fields[i]].map(e => e['value']).join(' / '));
                        break;
                }
            }
        }
    }

    // Show criminals with the same apprehended year
    if (criminal.apprehended.length > 0) {
        showSameApprehendedYear(criminal);
    } else {
        $('#same_apprehended_year').hide();
    }

    // Show criminals with the same conviction penalty
    if (criminal.convictionPenalty.length > 0) {
        showSameConvictionPenalty(criminal);
    } else {
        $('#same_conviction_penalty').hide();
    }

    // Show criminals with similar criminal charge
    if (criminal.criminalCharge.length > 0) {
        showSimilarCriminalCharge(criminal);
    } else {
        $('#similar_criminal_charge').hide();
    }

    // Show criminals with similar motive
    if (criminal.motive.length > 0) {
        showSimilarMotive(criminal);
    } else {
        $('#similar_motive').hide();
    }


    if (criminal.label.length > 0) {
        $('title').html(`${criminal.label[0]['value']} - Web sémantique`);
    } else if (criminal.name.length > 0) {
        $('title').html(`${criminal.name[0]['value']} - Web sémantique`);
    }

    if (criminal.name.length > 0) {
        $('#criminal_name').html(criminal.name[0]['value']);
    } else if (criminal.label.length > 0) {
        $('#criminal_name').html(criminal.label[0]['value']);
    } else {
        $('#criminal_name').html(criminalId);
    }

}

