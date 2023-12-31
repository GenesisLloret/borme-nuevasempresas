const pdfForm = document.getElementById('pdfForm');
const pdfUrlInput = document.getElementById('pdfUrlInput');
const pdfTextContainer = document.getElementById('pdfTextContainer');

pdfForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const pdfUrl = pdfUrlInput.value;
  electron.sendPDFUrl(pdfUrl);
});
electron.receivePDFText((data) => {
  const array = data.split("\n");
  var dataArray = array.splice(9);
  let startIndices = [];
  let endIndices = [];
  for (let i = 0; i < dataArray.length; i++) {
    if (/^\d+ - /.test(dataArray[i])) {
      startIndices.push(i);
    }
    if (/[\d\)]+\.$/.test(dataArray[i])) {
      endIndices.push(i);
    }
  }
  let tableHtml = "<table>"+
    "<tr>"+
    "<th>id</th>"+
    "<th>nombre</th>"+
    "<th>Comienzo de operaciones</th>"+
    "<th>Calle</th>"+
    "<th>Población</th>"+
    "<th>Capital</th>"+
    "<th>Objeto Social</th>"+
    "<th>Otros</th>"+
    "</tr>";
  for (let i = 0; i < startIndices.length; i++) {
    const start = startIndices[i];
    let end = endIndices.find((index) => index > start);
    if (end === undefined || end === "undefined") {
      end = dataArray.length - 1;
    }
    const paragraphs = dataArray.slice(start, end + 1);
    const joinedParagraphs = paragraphs.join(" ");
    if (joinedParagraphs.includes("Constitución.")) {
      const paragraphData = extractParagraphData(joinedParagraphs);
      tableHtml += "<tr>";
      tableHtml += "<td>" + paragraphData.id + "</td>";
      tableHtml += "<td>" + paragraphData.name + "</td>";
      tableHtml += "<td>" + paragraphData.starter + "</td>";
      tableHtml += "<td>" + paragraphData.calle + "</td>";
      tableHtml += "<td>" + paragraphData.poblacion + "</td>";
      tableHtml += "<td>" + paragraphData.capital + "</td>";
      tableHtml += "<td>" + paragraphData.objetoSocial + "</td>";
      tableHtml += "<td>" + paragraphData.otros + "</td>";
      tableHtml += "</tr>";
    }
  }
  tableHtml += "</table>";
  pdfTextContainer.innerHTML = tableHtml;
  pdfForm.style.display = "none";
});
function extractParagraphData(paragraph) {
  const tmp = paragraph.split(" - ");
  var id, name, starter, calle, poblacion, capital, objetoSocial, otros= "";
  if (tmp.length === 2) {
    id = tmp[0].trim();
    const tmp0 = tmp[1].trim();
    const tmp1 = tmp0.trim().split("Constitución.");
    if (tmp1.length === 2) {
      name = tmp1[0].trim();
      const tmp2 = tmp1[1].split("operaciones:");
      if (tmp2.length === 2) {
        const tmp3 = tmp2[1].trim().split("Objeto");
        starter = tmp3[0].trim().replace(/\./g, '-').replace(/\-$/, '');
        if (tmp3.length === 2) {
          const tmp4 = tmp3[1].trim().split('social:')
          const tmp5 = tmp4[1].trim().split('Domicilio:');
          objetoSocial = tmp5[0].trim();
          if (tmp5.length === 2) {
            const tmp6 = tmp5[1].trim().split('Capital:')
            const tmp6a = tmp6[0].trim().split('(');
            calle = tmp6a[0].trim();
            poblacion = tmp6a[1].trim().replace(").", '');
            if (tmp6.length === 2) {
              const tmp7 = tmp6[1].trim().split('Euros.');
              capital = tmp7[0].trim();
              otros = tmp7[1].trim();
            }
          }
        }
      }
    }
  }
  return {id, name, starter, calle, poblacion, capital, objetoSocial, otros};
};