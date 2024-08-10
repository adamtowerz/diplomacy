import { Construct } from "constructs";
import { aws_dynamodb as ddb, aws_iam as iam, RemovalPolicy } from "aws-cdk-lib";

export type LambdaApiOptions = {
  description: string;
};

export function DdbTable(scope: Construct, tableId: string) {
  const table = new ddb.Table(scope, tableId, {
    tableName: tableId,
    billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.RETAIN,
    partitionKey: { name: "pk", type: ddb.AttributeType.STRING },
    sortKey: { name: "sk", type: ddb.AttributeType.STRING },
  });

  function addGSI(pk: string, sk: string) {
    table.addGlobalSecondaryIndex({
      partitionKey: { name: pk, type: ddb.AttributeType.STRING },
      sortKey: { name: sk, type: ddb.AttributeType.STRING },
      indexName: `${pk}-${sk}-gsi`,
      projectionType: ddb.ProjectionType.ALL,
    });
  }

  function addLSI(sk: string) {
    table.addLocalSecondaryIndex({
      sortKey: { name: sk, type: ddb.AttributeType.STRING },
      indexName: `${sk}-lsi`,
      projectionType: ddb.ProjectionType.ALL,
    });
  }

  return { table, addGSI, addLSI };
}

const READ_ACTIONS = ["dynamodb:Get*", "dynamodb:Query", "dynamodb:Scan", "dynamodb:BatchGet*"];
const WRITE_ACTIONS = ["dynamodb:Delete*", "dynamodb:Update*", "dynamodb:PutItem", "dynamodb:BatchWrite*"];

export function allowTableReadWriteAccess(table: ddb.Table) {
  return new iam.PolicyStatement({
    resources: [table.tableArn, table.tableArn + "/index/*"],
    actions: [...READ_ACTIONS, ...WRITE_ACTIONS],
  });
}
