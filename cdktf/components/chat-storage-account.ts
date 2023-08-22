import { ResourceGroup } from ".././.gen/providers/azurerm/resource-group";
import { StorageAccount } from ".././.gen/providers/azurerm/storage-account";
import { StorageContainer } from ".././.gen/providers/azurerm/storage-container";
import { StorageManagementPolicy } from ".././.gen/providers/azurerm/storage-management-policy";
import { StorageTable } from ".././.gen/providers/azurerm/storage-table";
import { Construct } from "constructs";

export interface ChatStorageAccountProps {
  uniquePrefix: string;
  resourceGroup: ResourceGroup;
}

export class ChatStorageAccountConstruct extends Construct {
  public readonly chatStorageAccount: StorageAccount;


  constructor(scope: Construct, id: string, props: ChatStorageAccountProps) {
    super(scope, id);
    this.chatStorageAccount = new StorageAccount(this, "chatStorageAccount", {
      name: props.uniquePrefix + "storageaccount",
      resourceGroupName: props.resourceGroup.name,
      location: props.resourceGroup.location,
      accountTier: "Standard",
      accountReplicationType: "LRS",
      staticWebsite: {
        indexDocument: "index.html",
        error404Document: "404.html"
      }
    });

    new StorageTable(this, "chatStorageTable", {
      name: "chatHistory",
      storageAccountName: this.chatStorageAccount.name,
    });

    new StorageTable(this, "userStorageTable", {
      name: "users",
      storageAccountName: this.chatStorageAccount.name,
    });

    new StorageTable(this, "classesStorageTable", {
      name: "classes",
      storageAccountName: this.chatStorageAccount.name,
    });

    new StorageTable(this, "sessionsStorageTable", {
      name: "sessions",
      storageAccountName: this.chatStorageAccount.name,
    });

    new StorageTable(this, "marksStorageTable", {
      name: "marks",
      storageAccountName: this.chatStorageAccount.name,
    });

    new StorageContainer(this, "chatStorageBlob", {
      name: "voices",
      storageAccountName: this.chatStorageAccount.name,
      containerAccessType: "blob",
    });

    new StorageManagementPolicy(this, "StorageManagementPolicy", {
      storageAccountId: this.chatStorageAccount.id,
      rule: [{
        name: "DeleteOldBlobs",
        enabled: true,
        filters: {
          blobTypes: ["blockBlob"],
          prefixMatch: ["voices/"]
        },
        actions: {
          baseBlob: {
            deleteAfterDaysSinceModificationGreaterThan: 1
          }
        }
      }]
    });

    new StorageContainer(this, "screenStorageBlob", {
      name: "screens",
      storageAccountName: this.chatStorageAccount.name,
      containerAccessType: "blob",
    });

    new StorageManagementPolicy(this, "screenBlobStorageManagementPolicy", {
      storageAccountId: this.chatStorageAccount.id,
      rule: [{
        name: "DeleteOldBlobs",
        enabled: true,
        filters: {
          blobTypes: ["blockBlob"],
          prefixMatch: ["screens/"]
        },
        actions: {
          baseBlob: {
            deleteAfterDaysSinceModificationGreaterThan: 7
          }
        }
      }]
    });
  }
}
