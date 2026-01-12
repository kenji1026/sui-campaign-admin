import type { Adapter, AdapterUser } from "next-auth/adapters";
import { ObjectId, MongoClient } from "mongodb";

export function CustomMongoDBAdapter(
  clientPromise: Promise<MongoClient>
): Adapter {
  return {
    async createUser(user) {
      const client = await clientPromise;
      const db = client.db();
      const administrators = db.collection("administrators");
      const result = await administrators.insertOne({
        ...user,
        _id: new ObjectId(),
        emailVerified: user.emailVerified ?? null,
      });
      return {
        id: result.insertedId.toString(),
        ...user,
        emailVerified: user.emailVerified ?? null,
      } as AdapterUser;
    },

    async getUser(id) {
      const client = await clientPromise;
      const db = client.db();
      const administrators = db.collection("administrators");
      const user = await administrators.findOne({ _id: new ObjectId(id) });
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      const client = await clientPromise;
      const db = client.db();
      const administrators = db.collection("administrators");
      const user = await administrators.findOne({ email });
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const client = await clientPromise;
      const db = client.db();
      const accounts = db.collection("accounts");
      const account = await accounts.findOne({ provider, providerAccountId });
      if (!account) return null;
      const administrators = db.collection("administrators");
      const user = await administrators.findOne({ _id: account.userId });
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    async updateUser(user) {
      const client = await clientPromise;
      const db = client.db();
      const administrators = db.collection("administrators");
      const { id, ...rest } = user;
      await administrators.updateOne({ _id: new ObjectId(id) }, { $set: rest });
      const updatedUser = await administrators.findOne({
        _id: new ObjectId(id),
      });
      if (!updatedUser) return null;
      return {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        image: updatedUser.image,
      } as AdapterUser;
    },

    async deleteUser(id) {
      const client = await clientPromise;
      const db = client.db();
      const administrators = db.collection("administrators");
      await administrators.deleteOne({ _id: new ObjectId(id) });
      // Also delete related accounts, sessions, etc. if needed
    },

    // The rest of the adapter methods (accounts, sessions, verificationTokens) can be proxied to the default collections
    // For brevity, you can import and use the default MongoDBAdapter for those, or implement as needed
  };
}
