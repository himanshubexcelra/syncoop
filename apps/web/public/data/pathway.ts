export const PathwayData =
{
  "target": {
    "targetID": "1234",
    "targetSMILES": "COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
    "targetMW": 434.18417193199997,
    "orderID": "6789",
    "errorCode": 0,
    "DSFiles": null,
    "pathways": [
      {
        "pathIndex": 0,
        "pathConfidence": 0.9563652152208423,
        "stepCount": 3,
        "reactions": [
          {
            "rxnindex": 0,
            "nameRXN": {
              "code": "2.1.2",
              "label": "Carboxylic acid + amine condensation"
            },
            "rxnTemplateGroup": "Amide coupling",
            "rxnTemplate": "amide coupling",
            "rxnConfidence": 0.9946215748786926,
            "rxnSMILES": "COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1.Nc1ccc(C(=O)O)cc1>>COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
            "productSMILES": "COc1ccc(C2(CNC(=O)c3ccc(NC(=O)c4ccco4)cc3)CCOCC2)cc1",
            "productMW": 434.18417193199997,
            "conditions": {
              "temperature": 50,
              "solvent": "DMF"
            },
            "molecules": [
              {
                "molID": "1001",
                "reagentLabel": "Reagent E",
                "reagentSMILES": "COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1",
                "reagentName": "N-[[4-(4-methoxyphenyl)oxan-4-yl]methyl]furan-2-carboxamide",
                "role": "amine",
                "reactionPart": "reactant",
                "molarRatio": 2,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1002",
                "reagentLabel": "Reagent B",
                "reagentSMILES": "Nc1ccc(C(=O)O)cc1",
                "reagentName": "4-aminobenzoic acid",
                "role": "acid",
                "reactionPart": "reactant",
                "molarRatio": 1,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1003",
                "reagentLabel": "Reagent A",
                "reagentSMILES": "CCCP(O)(OP(CCC)(O)=O)=O",
                "reagentName": "T3P",
                "role": "amide coupling reagent",
                "reactionPart": "agent",
                "molarRatio": 1.5,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1004",
                "reagentLabel": "Reagent C",
                "reagentSMILES": "O=C(OCC)C(C#N)=NO",
                "reagentName": "Oxyma",
                "role": "additive",
                "reactionPart": "agent",
                "molarRatio": 2,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1005",
                "reagentLabel": "Reagent D",
                "reagentSMILES": "C1CCC2=NCCCN2CC1",
                "reagentName": "DBU",
                "role": "Base",
                "reactionPart": "agent",
                "molarRatio": 3,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              }
            ]
          },
          {
            "rxnindex": 1,
            "nameRXN": {
              "code": "2.1.40",
              "label": "O-acylhydroxylamine + amine reaction"
            },
            "rxnTemplateGroup": "Amide coupling",
            "rxnTemplate": "amide coupling",
            "rxnConfidence": 0.9995532631874084,
            "rxnSMILES": "O=C(ON1C(=O)CCC1=O)c1ccco1.COc1ccc(C2(CN)CCOCC2)cc1>>COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1",
            "productSMILES": "COc1ccc(C2(CNC(=O)c3ccco3)CCOCC2)cc1",
            "productMW": 315.147058152,
            "conditions": {
              "temperature": null,
              "solvent": "THF"
            },
            "molecules": [
              {
                "molID": "1006",
                "reagentLabel": "Reagent B",
                "reagentSMILES": "O=C(ON1C(=O)CCC1=O)c1ccco1",
                "reagentName": "(2,5-dioxopyrrolidin-1-yl) furan-2-carboxylate",
                "role": "acid",
                "reactionPart": "reactant",
                "molarRatio": 1,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1007",
                "reagentLabel": "Reagent E",
                "reagentSMILES": "COc1ccc(C2(CN)CCOCC2)cc1",
                "reagentName": "[4-(4-methoxyphenyl)oxan-4-yl]methanamine",
                "role": "amine",
                "reactionPart": "reactant",
                "molarRatio": 2,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1008",
                "reagentLabel": "Reagent A",
                "reagentSMILES": "CCN=C=NCCCN(C)C",
                "reagentName": "EDCI",
                "role": "amide coupling reagent",
                "reactionPart": "agent",
                "molarRatio": 1.5,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1009",
                "reagentLabel": "Reagent C",
                "reagentSMILES": "O=C(OCC)C(C#N)=NO",
                "reagentName": "Oxyma",
                "role": "additive",
                "reactionPart": "agent",
                "molarRatio": 2,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1010",
                "reagentLabel": "Reagent D",
                "reagentSMILES": "CN1CCOCC1",
                "reagentName": "NMM",
                "role": "Base",
                "reactionPart": "agent",
                "molarRatio": 3,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              }
            ]
          },
          {
            "rxnindex": 2,
            "nameRXN": {
              "code": "2.6.9",
              "label": "Steglich esterification"
            },
            "rxnTemplateGroup": "Amide coupling",
            "rxnTemplate": "amide coupling",
            "rxnConfidence": 0.9619665145874023,
            "rxnSMILES": "O=C1CCC(=O)N1O.O=C(O)c1ccco1>>O=C(ON1C(=O)CCC1=O)c1ccco1",
            "productSMILES": "O=C(ON1C(=O)CCC1=O)c1ccco1",
            "productMW": 209.032422324,
            "conditions": {
              "temperature": null,
              "solvent": "DMF"
            },
            "molecules": [
              {
                "molID": "1011",
                "reagentLabel": "Reagent E",
                "reagentSMILES": "O=C1CCC(=O)N1O",
                "reagentName": "1-hydroxypyrrolidine-2,5-dione",
                "role": "amine",
                "reactionPart": "reactant",
                "molarRatio": 2,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1012",
                "reagentLabel": "Reagent B",
                "reagentSMILES": "O=C(O)c1ccco1",
                "reagentName": "furan-2-carboxylic acid",
                "role": "acid",
                "reactionPart": "reactant",
                "molarRatio": 1,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1013",
                "reagentLabel": "Reagent A",
                "reagentSMILES": "F[P-](F)(F)(F)(F)F.N1([P+](N2CCCC2)(ON3N=NC4=CC=CC=C43)N5CCCC5)CCCC1",
                "reagentName": "PyBOP",
                "role": "amide coupling reagent",
                "reactionPart": "agent",
                "molarRatio": 1.5,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1014",
                "reagentLabel": "Reagent C",
                "reagentSMILES": "O=C(OCC)C(C#N)=NO",
                "reagentName": "Oxyma",
                "role": "additive",
                "reactionPart": "agent",
                "molarRatio": 2,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              },
              {
                "molID": "1015",
                "reagentLabel": "Reagent D",
                "reagentSMILES": "C12=NCCCN1CCCCC2",
                "reagentName": "DBU",
                "role": "Base",
                "reactionPart": "agent",
                "molarRatio": 3,
                "dispenseTime": null,
                "inventoryID": null,
                "inventoryURL": null
              }
            ]
          }
        ]
      }
    ]
  }
}