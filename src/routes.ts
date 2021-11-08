import { Router } from "express";
import PdfPrinter from "pdfmake";
import { prismaClient } from "./databases/prismaClient";
import fs from "fs";
import { TDocumentDefinitions } from "pdfmake/interfaces";

const router = Router();

router.get("/products", async (_, res) => {
  const products = await prismaClient.product.findMany();

  return res.json(products);
});

router.get("/products/report", async (_, res) => {
    const products = await prismaClient.product.findMany();

  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinitions: TDocumentDefinitions = {
    defaultStyle: { font: "Helvetica" },
    content: [
        { text: 'Relatório de Produtos', style : 'header' },
		{
			table: {
                widths : ["*","*",50,70],
				body: [
					['Id','Descrição', 'Preço', 'Quantidade'],
					...products.map(p => [p.id, p.description, p.price, p.quantity])
				]
			}
		},
    ],
    styles:{
        header: {
			fontSize: 18,
			bold: true,
			margin: [0, 0, 0, 10]
		},
    }
  };
  const pdfDoc = printer.createPdfKitDocument(docDefinitions);

  const chunks: any = [];

  pdfDoc.on("data", (chunk) => {
    chunks.push(chunk);
  });

  pdfDoc.end();

  pdfDoc.on("end", () => {
    const result = Buffer.concat(chunks);

    res.end(result);
  });
  //   pdfDoc.pipe(fs.createWriteStream("Relatorio.pdf"))
});

export { router };
