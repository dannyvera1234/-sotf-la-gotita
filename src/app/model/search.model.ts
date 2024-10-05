export class SearchModel {
  constructor(
    public limit: number,
    public offset: number,
    public search: string | null,
    public startDate: string | null,
    public endDate: string | null,
    public sortBy: string | null,
    public params: object | null,
  ) {}

  static get EMPTY(): SearchModel {
    return new SearchModel(10, 0, null, null, null, null, null);
  }

  public copyWith(search: {
    limit?: number;
    offset?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    params?: object;
  }): SearchModel {
    return new SearchModel(
      search.limit ?? this.limit,
      search.offset ?? this.offset,
      search.search ?? this.search,
      search.startDate ?? this.startDate,
      search.endDate ?? this.endDate,
      search.sortBy ?? this.sortBy,
      search.params ?? this.params,
    );
  }

  public currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  public toQuery(): string {
    const search = new URLSearchParams({
      limit: this.limit.toString(),
      offset: this.offset.toString(),
      search: this.search || '',
      start_date: this.startDate || '',
      end_date: this.endDate || '',
      sort_by: this.sortBy || '',
    });

    Object.keys(this.params ?? {})
      .filter((key) => (this.params as any)[key])
      .forEach((param) => {
        const value = (this.params as any)[param];
        if (Array.isArray(value)) {
          value.forEach((item) => search.append(`${param}[]`, item));
        } else {
          search.set(param, value);
        }
      });

    return search.toString();
  }
}
