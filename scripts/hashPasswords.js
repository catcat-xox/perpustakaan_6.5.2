const bcrypt = require("bcryptjs");
const db = require("../config/db");

async function hashPasswords() {
    try {
        const [users] = await db.query(`
            SELECT id, password
            FROM users
        `);

        for (const user of users) {

            // Jangan hash ulang password yang sudah bcrypt
            if (
                user.password.startsWith("$2a$") ||
                user.password.startsWith("$2b$") ||
                user.password.startsWith("$2y$")
            ) {
                continue;
            }

            const hashedPassword =
                await bcrypt.hash(
                    user.password,
                    10
                );

            await db.query(
                `
                UPDATE users
                SET password = ?
                WHERE id = ?
                `,
                [
                    hashedPassword,
                    user.id
                ]
            );

            console.log(
                `Password user ID ${user.id} berhasil di-hash.`
            );
        }

        console.log(
            "Migrasi password selesai."
        );

    } catch (error) {
        console.error(
            "Gagal melakukan migrasi password:",
            error
        );

    } finally {
        await db.end();
    }
}

hashPasswords();