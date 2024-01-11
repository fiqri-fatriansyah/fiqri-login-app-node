import prisma from "./prisma.js";
import users from "./seeds/users.json";

async function main() {
    const seedUsers = await Promise.all(
        users.map((user) => 
            prisma.UsersFiqri.upsert({
                where: { id: user.id },
                create: { ...user },
                update: { ...user },
            })
        )
    );

    console.log({ seedUsers });
}

main()
.then(async () => {
    await prisma.$disconnect();
})
.catch(async (e) => {
    console.log("Seeding database failed:", e);
    await prisma.$disconnect();
    process.exit(1);
});