const searchRequest = `
  PREFIX criminal: <http://dbpedia.org/ontology/Criminal>

  SELECT * WHERE {
    ?criminal a criminal:
  }
  LIMIT 200
`;

const predicates = [
  'foaf:name',
  'dbpedia2:alias',
  'rdfs:label',
  'dbpedia2:imageName',
  'dbo:country',
  'dbo:criminalCharge'
];

dbPediaRequest(searchRequest).then(function (data) {
  const searchResults = data.results.bindings;

  searchResults.forEach(searchResult => {
    const promises = predicates.map((p) => { return generateRequest(searchResult.criminal.value, p) })
    Promise.all(promises)
      .then(results => {
          appendSearchResult(searchResult, results);
      });
  });
});

function appendSearchResult(searchResult, result) {
  const resourceId = getResourceIdFromUri(searchResult.criminal.value);
  let component = $('#search-result-template').clone();
  setName(component, result);
  setAlias(component, result);
  setImage(component, result);
  setCountryFlag(component, result);
  setCriminalCharge(component, result);
  component.removeClass('d-none');
  component.on('click', function () {
    window.location.href = 'criminal.html?id=' + resourceId
  });
  component.appendTo('#search-results-list');
}

function setName(component, result) {
  let text = 'Not found';
  const name = getAttributeValue(result, 0);
  const label = getLabel(result);

  if (name && name != null) {
    console.log("name", name);
    text = name;
  } else if (label && label != null) {
    console.log("label", label);
    text = label;
  }
  component.find(".criminal-name").text(text);
}

function setAlias(component, result) {
  const alias = getAttributeValue(result, 1);
  if (alias) {
    let aliasSpan = component.find(".criminal-alias")
    aliasSpan.removeClass('d-none');
    aliasSpan.text(alias);
  }
}

function setImage(component, result) {
  const imgName = getAttributeValue(result, 3);
  if (imgName) {
    const image = component.find('.criminal-image');
    image.attr('src', 'https://wikipedia.org/wiki/Special:FilePath/' + imgName);
    image.attr('title', imgName);
    image.attr('alt', imgName);
  }
}

function setCountryFlag(component, result) {
  const countriesUrl = getAttributeValues(result, 4);
  if (countriesUrl) {
    for (let i = 0; i < countriesUrl.length; i++) {
      const countryUrl = countriesUrl[i].value.value;
      const splitCountryUrl = countryUrl.split('/');
      const countryName = splitCountryUrl[splitCountryUrl.length-1];
      component.find('.criminal-country').append(`<img src="https://wikipedia.org/wiki/Special:FilePath/Flag_of_${countryName}.svg" 
        title="${countryName}" 
        alt="${countryName}" 
        height=18
        class="pe-1"/>`);
    }
  }
}

function setCriminalCharge(component, result) {
  const criminalCharge = getAttributeValue(result, 5);
  if (criminalCharge) {
    console.log('LAAAA');
    var length = 80;
    var trimmedString = criminalCharge.length > length ? 
                        criminalCharge.substring(0, length - 3) + '...' : 
                        criminalCharge;
    component.find('.criminal-charge').append('Poursuites pénales : ' + trimmedString);
  }
}

function getAttributeValue(result, index) {
  let value = null;
  if (result[index].results.bindings.length > 0) {
    value = result[index].results.bindings[0].value.value;
  }
  return value;
}

function getAttributeValues(result, index) {
  let values = null;
  if (result[index].results.bindings.length > 0) {
    values = result[index].results.bindings;
  }
  return values;
}

function getLabel(result) {
  let value = null;
  if (result[2].results.bindings.length > 0) {
    const enLabel = result[2].results.bindings.find(function (binding) {
      return binding.value['xml:lang'] === 'en';
    });
    if (enLabel) {
      value = enLabel.value.value;
    }
  }
  return value;
}

function getResourceIdFromUri(uri) {
  const splitUri = uri.split('/');
  return splitUri[splitUri.length - 1];
}