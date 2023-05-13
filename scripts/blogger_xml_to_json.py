import os
import json
import re
from abc import ABC
from typing import Final, List, Dict, Any, Optional, Union
from datetime import datetime
import xml.etree.ElementTree as et
from bs4 import BeautifulSoup, Tag
from urllib.request import urlretrieve as download
from base64 import urlsafe_b64encode


XML_DUMP_FILE: Final[str] = "data/blog-02-06-2023.xml"
JSON_DATA_FOLDER: Final[str] = "src/data/blog"
IMAGE_FOLDER: Final[str] = "data/images"


class Author:
    def __init__(self, element: et.Element):
        for child in element:
            match _clean_tag(child.tag):
                case 'name':
                    self.name = child.text
                case 'email':
                    self.email = child.text


class _Entry(ABC):
    author: Author
    categories: List[str]
    content: str
    draft: bool
    extended_properties: Dict[str, str]
    path: str
    published: datetime
    thumbnail: str
    title: str
    updated: datetime
    total: int

    def __init__(self, element: et.Element):
        self.categories = []
        self.title = ""
        self.content = ""
        self.published = datetime.now()
        self.updated = self.published
        self.draft = False
        self.path = ""
        for child in element:
            match _clean_tag(child.tag):
                case 'author':
                    self.author = Author(child)
                case 'category':
                    if _clean_category_scheme(child.attrib['scheme']) == 'post_category':
                        self.categories.append(child.attrib['term'])
                case 'content':
                    self.content = _clean_content(child.text)
                case 'control':
                    self.draft = _clean_tag(child[0].tag) == 'draft' and child[0].text == 'yes'
                case 'extendedProperty':
                    if not hasattr(self, 'extended_properties'):
                        self.extended_properties = {}
                    self.extended_properties[child.attrib['name']] = child.attrib['value']
                case 'id':
                    pass
                case 'in-reply-to':
                    pass
                case 'link':
                    if child.attrib['rel'] == 'alternate':
                        self.path = _get_url_path(child.attrib['href'])
                case 'published':
                    self.published = datetime.strptime(child.text, "%Y-%m-%dT%H:%M:%S.%f%z") if child.text else datetime.now()
                case 'thumbnail':
                    pass
                case 'title':
                    self.title = child.text if child.text else ""
                case 'total':
                    pass
                case 'updated':
                    self.updated = datetime.strptime(child.text, "%Y-%m-%dT%H:%M:%S.%f%z") if child.text else datetime.now()

    def __iter__(self):
        yield self


class Template(_Entry):
    def __repr__(self) -> str:
        return f"[Template] - {self.title}"


class Page(_Entry):
    def __repr__(self) -> str:
        return f"[Page] - {self.title}"


class Post(_Entry):

    @property
    def id(self) -> str:
        return self.path.split('/')[-1]

    @property
    def html(self) -> BeautifulSoup:
        if not hasattr(self, '_html'):
            self._html = BeautifulSoup(self.content, 'html.parser')
        return self._html

    def as_dict(self) -> Dict[str, Any]:
        self.content = str(self.html)
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "published": self.published.isoformat(),
            "updated": self.updated.isoformat(),
            "draft": self.draft,
            "categories": self.categories,
        }

    def __repr__(self) -> str:
        return f"[Post] - {self.title}"



class Comment(_Entry):
    def __repr__(self) -> str:
        return f'[Comment] - {self.author.name}: "{self.content}"'


class Setting(_Entry):
    def __init__(self, element: et.Element):
        for child in element:
            match _clean_tag(child.tag):
                case 'id':
                    self.name = _clean_setting_name(child.text)
                case 'title':
                    self.description = child.text
                case 'content':
                    self.value = child.text
                case other:
                    pass

    def __repr__(self) -> str:
        return f"[Setting] - {self.name}: {self.value}  ({self.description})"


def _clean_tag(tag: str) -> str:
    tag = tag.replace("{http://www.w3.org/2005/Atom}", "")
    tag = tag.replace("{http://schemas.google.com/g/2005}", "")
    tag = tag.replace("{http://purl.org/syndication/thread/1.0}", "")
    tag = tag.replace("{http://purl.org/atom/app#}", "")
    tag = tag.replace("{http://search.yahoo.com/mrss/}", "")
    return tag


def _clean_setting_name(name: Optional[str]) -> str:
    if not name:
        return ""
    return name.replace('tag:blogger.com,1999:blog-7253891661294505258.', '')


def _clean_category_scheme(scheme: str) -> str:
    match scheme:
        case 'http://schemas.google.com/g/2005#kind':
            return 'entry_type'
        case 'http://www.blogger.com/atom/ns#':
            return 'post_category'
        case other:
            raise ValueError(f'Unrecognised scheme: "{scheme}"')


def _get_url_path(url: str) -> str:
    path = url
    path = path.replace('https://[^/]+/', '')
    path = path.replace('.html', '')
    return path


def _clean_type_term(term: str) -> str:
    return term.replace('http://schemas.google.com/blogger/2008/kind#', '')


def _get_entry_type(element: et.Element) -> str:
    category_objects: List[str] = [
        _clean_type_term(obj.attrib['term']) for obj in element
        if _clean_tag(obj.tag) == 'category' and _clean_category_scheme(obj.attrib['scheme']) == 'entry_type'
    ]
    match len(category_objects):
        case 1:
            return category_objects[0]
        case 0:
            raise TypeError(f"Too many categories: {category_objects}")
        case other:
            raise TypeError(f"Missing category: {element}")


def _clean_content(content: Optional[str]) -> str:
    if not content:
        return ""
    content = _clean_gists(content)
    return content


def _clean_gists(content: str) -> str:
    gist_pattern = re.compile(r'<script src="https://gist.github.com/(?P<user>[^/]+)/(?P<code>[0-9a-f]+).js"></script>')
    gist_code = re.search(gist_pattern, content)
    if gist_code:
        code = gist_code.group('code')
        username = gist_code.group('user')
        old_tag = gist_code.group(0)
        new_tag = f"""
            <app-gist-container id="gist-{code}" src="https://gist.github.com/{username}/{code}.js"></app-gist-container>
            """
        content = content.replace(old_tag, new_tag)
    return content


def _parse_entry(element: et.Element) -> _Entry:
    entry_type = _get_entry_type(element)
    match entry_type:
        case 'comment':
            return Comment(element)
        case 'post':
            return Post(element)
        case 'page':
            return Page(element)
        case 'settings':
            return Setting(element)
        case 'template':
            return Template(element)
        case other:
            raise TypeError(f"Unrecognised entry type: {entry_type}")


def _parse_tree(element: et.Element) -> Any:
    tag = _clean_tag(element.tag)
    match tag:
        case 'feed':
            return [_parse_tree(entry) for entry in element if _clean_tag(entry.tag) == 'entry']
        case 'author':
            return Author(element)
        case 'entry':
            return _parse_entry(element)
        case 'control':
            return _clean_tag(element[0].tag) == 'draft' and element[0].text == 'yes'
        case other:
            return str(element.text) if element.text else str(element)


def read_blogger_xml(filename: str = XML_DUMP_FILE) -> List[Post]:
    tree: et.ElementTree = et.parse(filename)
    root: et.Element = tree.getroot()

    posts = [item for item in _parse_tree(root) if type(item) is Post]
    posts.sort(key=lambda post: post.published)
    return [p for p in posts if p.draft is False]


def _get_post_json_path(post: Post) -> str:
    return f"{JSON_DATA_FOLDER}/posts/{post.id}.json"



def _get_summary_for_post(post: Post) -> Dict[str, Any]:
    return {
        "title": post.title,
        "id": post.id,
        "published": post.published.isoformat(),
        "length": len(post.content),
        "categories": post.categories,
    }


def _write_post_path_lookup_file(posts: List[Post]) -> None:
    summary_data = [_get_summary_for_post(post) for post in posts if len(post.path) > 0]
    with open(f"{JSON_DATA_FOLDER}/summary.json", 'w') as summary_file:
        json.dump(summary_data, summary_file, separators=(',', ':'))


def _write_post_json_file(post: Post) -> None:
    post.content = str(post.html)
    if not post.draft:
        with open(_get_post_json_path(post), 'w') as post_file:
            json.dump(post.as_dict(), post_file)


def _prepare_folder_structure() -> None:
    if not os.path.exists(JSON_DATA_FOLDER):
        os.makedirs(JSON_DATA_FOLDER)
    if not os.path.exists(f"{JSON_DATA_FOLDER}/posts"):
        os.makedirs(f"{JSON_DATA_FOLDER}/posts")


def _assert_no_duplicate_ids(posts: List[Post]) -> None:
    ids = [post.id for post in posts]
    ids.sort()
    assert len(ids) == len(set(ids)), "Duplicate IDs found"

def _fnv_64_hash(string: str) -> str:
    hash = 0xcbf29ce484222325
    for char in string:
        hash *= 0x100000001b3
        hash &= 0xffffffffffffffff
        hash ^= ord(char)
    code = urlsafe_b64encode(hash.to_bytes(8, 'big')).decode('utf-8')
    return code.replace('=', '')


def _get_extension(url: str) -> str:
    url = url.split('?')[0]
    return url.split('.')[-1].lower()


def _get_domain(url: str) -> str:
    return url.split('/')[2]


def _get_image_filename(url: str) -> str:
    return f"{IMAGE_FOLDER}/{_fnv_64_hash(url)}.{_get_extension(url)}"


def _get_image_tags(post: Post) -> List[Tag]:
    return [img for img in post.html.find_all('img')]


def _replace_image_links(post: Post) -> None:
    image_tags = _get_image_tags(post)
    for image in image_tags:
        old_src = str(image['src'])
        old_src = re.sub(r'/s\d+/', '/s1600/', old_src)
        old_src_alt = re.sub(r'/s\d+/', '/s1600-h/', old_src)
        new_src = _get_image_filename(str(image['src']))

        target =  'src/' + new_src
        if not os.path.exists(target):
            download(old_src, target)

        if image.parent and image.parent.name == 'a':
            if image.parent['href'] in [old_src, old_src_alt] or _get_domain(str(image.parent['href'])) == 'imgur.com':
                image.parent['href'] = new_src

        image['src'] = new_src


def _replace_latex_links(post: Post) -> None:
    image_tags = post.html.find_all('img')
    sources = [img['src'] for img in image_tags]
    is_latex_filter = [_get_domain(src) == 'latex.codecogs.com' for src in sources]
    latex_tags = [image_tags[i] for i in range(len(image_tags)) if is_latex_filter[i]]

    for tag in latex_tags:
        latex = tag['src'].split('?')[1]
        latex = _clean_latex(latex)

        new_tag: Tag = Tag(name='app-latex')
        new_tag.string = latex

        if tag.parent.name == 'a' and _get_domain(tag.parent['href']) == 'www.codecogs.com':
            tag.parent.replace_with(new_tag)
        else:
            tag.replace_with(new_tag)


def _clean_latex(latex: str) -> str:
    latex = latex.replace('\\bg_black', '')
    latex = latex.replace('&space;', '')
    latex = latex.replace('\\color{White}', '')
    latex = latex.replace('\\small', '')
    latex = latex.replace('\\Delta', '\\Delta ')
    latex = latex.replace('\\rho', '\\rho ')
    return latex.strip()


def _fix_readmore(post: Post) -> None:
    readmore_links = post.html.find_all('span', {'id': 'readmore'})
    for readmore_link in readmore_links:
        if readmore_link is not None and type(readmore_link) is Tag:
            readmore_link.name = 'div'
            del readmore_link['id']
            readmore_link['class'] = 'readmore'
        

if __name__ == "__main__":
    _prepare_folder_structure()

    posts = read_blogger_xml(XML_DUMP_FILE)
    _assert_no_duplicate_ids(posts)

    _write_post_path_lookup_file(posts)

    for post in read_blogger_xml(XML_DUMP_FILE):
        print(post)

        _replace_latex_links(post)
        _replace_image_links(post)
        _fix_readmore(post)

        _write_post_json_file(post)

