import * as bcrypt from 'bcrypt';

export class BcryptUtil {
  /**
   * 生成密码的哈希值
   * @param password 明文密码
   * @returns 哈希后的密码
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  /**
   * 校验密码是否匹配
   * @param password 明文密码
   * @param hash 数据库中存储的哈希密码
   * @returns 是否匹配
   */
  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
