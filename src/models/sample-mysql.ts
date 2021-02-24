import * as TypeORM from 'typeorm'
import Boom   from '@hapi/boom'
import config from '../configs/config'

@TypeORM.Entity()
export class Sample {

  /**
   * Model Constructor
   * @param payload Object data to assign
   */
  constructor(payload: Sample) { Object.assign(this, payload) }

  @TypeORM.PrimaryGeneratedColumn()
  id: string

  @TypeORM.Column({ length: 24, unique: true })
  someId: string

  @TypeORM.Column({ default: 1 })
  age: number

  @TypeORM.Column({ default: true })
  isActive: boolean

  @TypeORM.Column({ length: 100 })
  name: string

  @TypeORM.Column({ default: new Date().getTime() })
  createdAt: number

  @TypeORM.Column({ default: 0 })
  updatedAt: number

  @TypeORM.Column({ default: 0 })
  deletedAt: number

  @TypeORM.BeforeInsert()
  @TypeORM.BeforeUpdate()
  async setDates(): Promise<boolean> {
    try {
      const now: number = new Date().getTime()
      if(!this.createdAt) this.createdAt = now
      else this.updatedAt = now
      return true
    } catch (error) {
      console.log('Model Before Save Error: ', error)
      throw Boom.badImplementation(error.message)
    }
  }

}

export interface IQueryData {
  page: number
  size: number
  deletedAt: number       // Always filter deleted documents
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any      // needs to specified later based on entity or model
}

export class SampleRepository {

  private repository: TypeORM.Repository<Sample> = TypeORM.getRepository<Sample>(Sample, config.env.DB_CONNECTION)

  async add(data: Sample): Promise<Sample> {
    const sample: Sample = new Sample(data)
    return await this.repository.save(sample)
  }

  async list(queryData: IQueryData): Promise<{ total: number, list: Sample[] }> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, size, ...query } = queryData
    query.deletedAt = 0
    query.isActive = true

    // query.order = { [config.sortTypes[query.sortBy]]: 'DESC' }
    // delete query.sortBy
    const [ list, total ] = await this.repository.findAndCount(query)
    return { total, list }
  }

  async details(someId: string): Promise<Sample> {
    const sample: Sample | undefined = await this.repository.findOne({ someId })
    if(!sample || sample.deletedAt !== 0 || !sample.isActive) throw Boom.notFound('Sample is not found.')
    return sample
  }

  async updateByQuery(query: IQueryData, data: Sample): Promise<TypeORM.UpdateResult> {
    const sample: Sample | undefined = await this.repository.findOne(query)
    if(!sample || sample.deletedAt !== 0 || !sample.isActive) throw Boom.notFound('Sample is not found.')
    const result = await this.repository.update(query, data)
    return result
  }

  async updateById(someId: string, data: Sample): Promise<TypeORM.UpdateResult> {
    const sample: Sample = await this.details(someId)
    return await this.repository.update(sample.id, data)
  }

  async softDelete(someId: string): Promise<TypeORM.UpdateResult> {
    const sample: Sample = await this.details(someId)
    return await this.repository.update(sample.id, { deletedAt: new Date().getTime() })
  }

  async remove(someId: string): Promise<Sample | { isSampleRemoved: boolean }> {
    const sample: Sample | undefined = await this.repository.findOne({ someId })
    if(!sample) return { isSampleRemoved: false }
    return await this.repository.remove(sample)
  }

  async restore(someId: string): Promise<TypeORM.UpdateResult> {
    const sample: Sample = await this.details(someId)
    return await this.repository.update(sample.id, { deletedAt: 0 })
  }
}



// --------------- Swagger Models Definition ---------------

/**
 * @swagger
 *  components:
 *    schemas:
 *      Sample:
 *        type: object
 *        required:
 *          - name
 *          - email
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *            format: email
 *            description: Email for the user, needs to be unique.
 *        example:
 *          name: 'Amin'
 *          email: 'amin@gmail.com'
 */