import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class WeatherCache {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  city!: string;

  @Column()
  date!: string;

  @Column('float')
  celsius!: number;

  @Column('float')
  fahrenheit!: number;

  @Column()
  fetchedAt!: Date;
}
