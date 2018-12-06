const $ = (q) => document.querySelector(q);
const $$ = (qa) => Array.from(document.querySelector(qq));

const hereCredentials = {
   id: 'UQ75LhFcnAv0DtOUwBEA',
   code: 'f5nyezNmYF4wvuJqQgNSkg'
}

//
// $('.drop').ondragover = (evt) => {
//    $('.drop').value = 'drop'
// }
//
// $('.drop').ondragleave = (evt) => {
//    $('.drop').value = ''
// }
//
// $('.drop').ondrop = (evt) => {
//
//    // evt.preventDefault();
//    const unParsedCsv = evt.dataTransfer.items[0].getAsFile();
//    console.log(unParsedCsv)
// }
const fileInput = $('#files')
const readFile = function() {
   var reader = new FileReader();
   reader.onload = function() {
      // document.getElementById('out').innerHTML = reader.result;
      console.log('reading...')
      prepFile(reader.result)

   };
   // start reading the file. When it is done, calls the onload event defined above.
   reader.readAsBinaryString(fileInput.files[0]);
};

$('#files').onchange = readFile;

function prepFile(f) {
   const outputAsDict = Papa.parse(f, {
      header: true
   });
   const outputasArray = Papa.parse(f);

   const headers = Object.keys(outputAsDict.data[0]);
   console.log(outputAsDict)
   // $('.output').value = outputasArray.data.map(x => `${x}\n`);

   outputAsDict.data = outputAsDict.data.filter(x => Object.keys(x).length === headers.length)

   $('.output').value = Object.keys(outputAsDict.data[0]) +'\n';
   for (let i = 0; i < outputAsDict.data.length; i++) {
      $('.output').value += Object.values(outputAsDict.data[i]) + '\n';
   }

   const select = document.createElement('select');
   select.id = 'header-options';
   for (let i = 0; i < headers.length; i++) {
      const option = document.createElement('option');
      option.innerText = headers[i];
      option.id = `header-${i}`;
      option.classList.add('header')
      select.appendChild(option);
   }
   document.body.appendChild(select);

   const button = document.createElement('button');
   button.innerText = 'Geocode';
   document.body.appendChild(button);

   button.onclick = () => {
      const selection = $('#header-options').options[$('#header-options').selectedIndex].innerText;
      console.log(selection)
      const urls = outputAsDict.data.map(x => makeGeocodeUrl(x[selection]));
      console.log(urls);

      const promises = urls.map(url => fetch(url).then(y => y.json()));
      Promise.all(promises).then(res => {
         console.log(res)
         const dataCopy = JSON.parse(JSON.stringify(outputAsDict.data))
         const errorLines = []
         for (let i = 0; i < dataCopy.length; i++) {

            if (res[i].Response.hasOwnProperty('View') && res[i].Response.View.length > 0) {

               dataCopy[i].latitude = res[i].Response.View[0].Result[0].Location.NavigationPosition[0].Latitude;
               dataCopy[i].longitude = res[i].Response.View[0].Result[0].Location.NavigationPosition[0].Longitude;

            } else {
               errorLines.push(i)
               dataCopy[i].latitude = 'error'
               dataCopy[i].longitude = 'error'

            }
            console.log(dataCopy[i].latitude)
         }

         $('.output').value = Object.keys(dataCopy[0]) +'\n';
         for (let i = 0; i < dataCopy.length; i++) {
            $('.output').value += Object.values(dataCopy[i]) + '\n';
         }
         const p = document.createElement('p');
         p.innerHTML = 'Done!';
         document.body.appendChild(p);
         if (errorLines.length > 0) {
            alert('Error with lines ' + errorLines.map(x => x + 2))
         }



         // const download = document.createElement('button');
         // download.innerText = 'Download CSV';
         // document.body.appendChild(download);
         // download.onclick = () => {
         //    downloadFile($('.output').value, 'geocoded-csv.csv');
         // }

      });

   }


}

function makeGeocodeUrl(query) {
   return `https://geocoder.api.here.com/6.2/geocode.json?app_id=${hereCredentials.id}&app_code=${hereCredentials.code}&searchtext=${query}`;
}

function downloadFile(file, fileName) {
   const element = document.createElement('a');
   element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(file)));
   element.setAttribute('download', fileName);
   element.style.display = 'none';
   document.body.appendChild(element);
   element.click();
   document.body.removeChild(element);
}
